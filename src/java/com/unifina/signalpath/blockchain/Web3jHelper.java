package com.unifina.signalpath.blockchain;

import org.apache.log4j.Logger;
import org.web3j.abi.*;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.AbiTypes;
import org.web3j.abi.datatypes.generated.Uint160;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.Response;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.*;
import org.web3j.tx.Contract;
import org.web3j.utils.Numeric;

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.ParameterizedType;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Web3jHelper {
	private static final Logger log = Logger.getLogger(Web3jHelper.class);
	protected static Pattern ARRAY_SUFFIX = Pattern.compile("\\[(\\d*)\\]$");

	/**
	 * @param solidity_type ABI json type description
	 * @param value Compatible value (will be coerced if necessary)
	 * @return Web3j Type (= Solidity type PLUS its value)
	 */
	public static Type instantiateType(String solidity_type, Object value) throws InvocationTargetException, NoSuchMethodException, InstantiationException, IllegalAccessException, ClassNotFoundException {
		return instantiateType(makeTypeReference(solidity_type), value);
	}

	public static Function encodeFunction(String fnname, List<String> solidity_inputtypes, List<Object> arguments, List<String> solidity_output_types) throws ClassNotFoundException, NoSuchMethodException, InstantiationException, IllegalAccessException, InvocationTargetException {
		List<Type> encoded_input = new ArrayList<>();
		Iterator argit = arguments.iterator();
		for (String st : solidity_inputtypes) {
			encoded_input.add(instantiateType(st, argit.next()));
		}
		List<TypeReference<?>> encoded_output = new ArrayList<>();
		for (String st : solidity_output_types) {
			encoded_output.add(makeTypeReference(st));
		}
		return new Function(fnname, encoded_input, encoded_output);
	}
	/*
		Web3j uses a TypeReference to indicate the Solidity type.
		In the case of atomic types (uint, bytes, etc), the TypeReference just wraps a Class (implementing org.web3j.abi.datatypes.Type).
		In the case of arrays, the TypeReference wraps a java.lang.reflect.ParamaterizedType to indicate the array type
			(eg ParamaterizedType references StaticArray5<Uint> for uint[5] or DynamicArray<StaticArray5<Address>> for address[5][])
	 */


	public static TypeReference makeTypeReference(String solidity_type) throws ClassNotFoundException {
		return makeTypeReference(solidity_type,false);
	}
	public static TypeReference makeTypeReference(String solidity_type, final boolean indexed) throws ClassNotFoundException {
		Matcher m = ARRAY_SUFFIX.matcher(solidity_type);
		if(!m.find()) {
			final Class tc = getAtomicTypeClass(solidity_type);
			return createTypeReference(tc, indexed);
		}
		String digits = m.group(1);
		TypeReference baseTr = makeTypeReference(solidity_type.substring(0,solidity_type.length() - m.group(0).length()));
		TypeReference<?> ref;
		if (digits == null || digits.equals("")) {
			ref = new TypeReference<DynamicArray>(indexed) {
				@Override
				public java.lang.reflect.Type getType(){
					return new ParameterizedType() {
						@Override
						public java.lang.reflect.Type[] getActualTypeArguments() {
							return new java.lang.reflect.Type[]{baseTr.getType()};
						}

						@Override
						public java.lang.reflect.Type getRawType() {
							return DynamicArray.class;
						}

						@Override
						public java.lang.reflect.Type getOwnerType() {
							return Class.class;
						}
					};
				}
			};
		}
		else {
			final Class arrayclass = Class.forName("org.web3j.abi.datatypes.generated.StaticArray" + digits);
			ref = new TypeReference.StaticArrayTypeReference<StaticArray>(Integer.parseInt(digits)){
				@Override
				public boolean isIndexed(){
					return indexed;
				}
				@Override
				public java.lang.reflect.Type getType(){
					return new ParameterizedType() {
						@Override
						public java.lang.reflect.Type[] getActualTypeArguments() {
							return new java.lang.reflect.Type[]{baseTr.getType()};
						}

						@Override
						public java.lang.reflect.Type getRawType() {
							return arrayclass;
						}

						@Override
						public java.lang.reflect.Type getOwnerType() {
							return Class.class;
						}
					};
				}
			};
		}
		return ref;
	}


	public static Type instantiateType(TypeReference ref, Object value) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException, ClassNotFoundException {
		Class rc = ref.getClassType();
		if(Array.class.isAssignableFrom(rc)){
			List values;
			if (value instanceof List) {
				values = (List) value;
			} else if (value.getClass().isArray()) {
				values = arrayToList(value);
			} else {
				throw new ClassCastException("Arg of type " + value.getClass() + " should be a list to instantiate web3j Array");
			}
			Constructor listcons;
			int arraySize = ref instanceof TypeReference.StaticArrayTypeReference ? ((TypeReference.StaticArrayTypeReference) ref).getSize() : -1;
			if (arraySize <= 0) {
				listcons = DynamicArray.class.getConstructor(new Class[]{Class.class, List.class});
			} else {
				Class arrayClass = Class.forName("org.web3j.abi.datatypes.generated.StaticArray" + arraySize);
				listcons = arrayClass.getConstructor(new Class[]{Class.class, List.class});
			}
			//create a list of transformed arguments
			ArrayList transformedList = new ArrayList(values.size());
			java.lang.reflect.Type subtype = ((ParameterizedType) ref.getType()).getActualTypeArguments()[0];
			for (Object o : values) {
				TypeReference elementTR;
				//array of arrays
				if(subtype instanceof ParameterizedType){
					elementTR = new TypeReference<Array>() {
						@Override
						public java.lang.reflect.Type getType(){
							return subtype;
						}
					};
				}
				//array of basic types
				else{
					elementTR = TypeReference.create((Class) subtype);
				}
				transformedList.add(instantiateType(elementTR, o));
			}
			return (Type) listcons.newInstance(ref.getClassType(), transformedList);
		}

		Object constructorArg = null;
		if (NumericType.class.isAssignableFrom(rc)) {
			constructorArg = asBigInteger(value);
		} else if (BytesType.class.isAssignableFrom(rc)) {
			if (value instanceof byte[]) {
				constructorArg = value;
			} else if (value instanceof BigInteger) {
				constructorArg = ((BigInteger) value).toByteArray();
			} else if (value instanceof String) {
				constructorArg = Numeric.hexStringToByteArray((String) value);
			}
		} else if (Utf8String.class.isAssignableFrom(rc)) {
			constructorArg = value.toString();
		} else if (Address.class.isAssignableFrom(rc)) {
			if (value instanceof BigInteger || value instanceof Uint160) {
				constructorArg = value;
			} else {
				constructorArg = value.toString();
			}
		} else if (Bool.class.isAssignableFrom(rc)) {
			if (value instanceof Boolean) {
				constructorArg = value;
			} else {
				BigInteger bival = asBigInteger(value);
				constructorArg = bival == null ? null : !bival.equals(BigInteger.ZERO);
			}
		}
		if (constructorArg == null) {
			throw new RuntimeException("Could not create type " + rc + " from arg " + value.toString() + " of type " + value.getClass());
		}
		Constructor cons = rc.getConstructor(new Class[]{constructorArg.getClass()});
		return (Type) cons.newInstance(constructorArg);
	}

	/**
	 * This is a helper method that only works for atomic types (uint, bytes, etc). Array types must be wrapped by a java.lang.reflect.ParamaterizedType
	 * @param type
	 * @return
	 * @throws ClassNotFoundException
	 */

	protected static Class getAtomicTypeClass(String type) throws ClassNotFoundException {
		Matcher m = ARRAY_SUFFIX.matcher(type);
		if (m.find()) {
			throw new ClassNotFoundException("getTypeClass does not work with array types. See makeTypeRefernce()");
		}
		switch (type) {
			case "int":
				return Int.class;
			case "uint":
				return Uint.class;
		}
		Class c = AbiTypes.getType(type);
		return c;
	}

	public static Function toWeb3jFunction(EthereumABI.Function fn, List args) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
		List<String> solidity_inputtypes = new ArrayList<String>(fn.inputs.size());
		List<String> solidity_outputtypes = new ArrayList<String>(fn.outputs.size());

		for (int i = 0; i < fn.inputs.size(); i++) {
			solidity_inputtypes.add(fn.inputs.get(i).type);
		}
		for (int i = 0; i < fn.outputs.size(); i++) {
			solidity_outputtypes.add(fn.outputs.get(i).type);
		}
		return Web3jHelper.encodeFunction(fn.name, solidity_inputtypes, args, solidity_outputtypes);
	}

	public static Event toWeb3jEvent(EthereumABI.Event ev) throws ClassNotFoundException {
		ArrayList<TypeReference<?>> params = new ArrayList<TypeReference<?>>();
		for (EthereumABI.Slot s : ev.inputs) {
			params.add(Web3jHelper.makeTypeReference(s.type, s.indexed));
		}
		Event web3jevent = new Event(ev.name, params);
		return web3jevent;
	}

	public static List<EventValues> extractEventParameters(Event event, TransactionReceipt transactionReceipt) {
		List<Log> logs = transactionReceipt.getLogs();
		return extractEventParameters(event,logs);
	}
	public static List<EventValues> extractEventParameters(Event event, List<? extends Log> logs) {
		List<EventValues> values = new ArrayList<>();
		for (Log log : logs) {
			EventValues eventValues = Contract.staticExtractEventParameters(event, log);
			if (eventValues != null) {
				values.add(eventValues);
			}
		}
		return values;
	}

	/*
		this is based on TypeReference.create(Class c), which doesn't expose the indexed flag
	 */
	protected static <T extends Type> TypeReference<T> createTypeReference(final Class<T> cls, boolean indexed) {
		return new TypeReference<T>(indexed) {
			public java.lang.reflect.Type getType() {
				return cls;
			}
		};
	}

	public static BigInteger asBigInteger(Object arg) {
		if (arg instanceof BigInteger) {
			return (BigInteger) arg;
		} else if (arg instanceof BigDecimal) {
			return ((BigDecimal) arg).toBigInteger();
		} else if (arg instanceof String) {
			return Numeric.toBigInt((String) arg);
		} else if (arg instanceof byte[]) {
			return Numeric.toBigInt((byte[]) arg);
		} else if (arg instanceof Number) {
			return BigInteger.valueOf(((Number) arg).longValue());
		}
		return null;
	}

	public static List arrayToList(Object array) {
		int len = java.lang.reflect.Array.getLength(array);
		ArrayList rslt = new ArrayList(len);
		for (int i = 0; i < len; i++) {
			rslt.add(java.lang.reflect.Array.get(array, i));
		}
		return rslt;
	}

	/**
	 * get item (i,j,k...) from a multi-dimensional Web3j array
	 * @param array
	 * @param indices
	 * @return
	 */

	public static Type web3jArrayGet(Array array,int... indices){
		Array ar = array;
		Object val=null;
		for(int d=0;d<indices.length;d++){
			val = ar.getValue().get(indices[d]);
			if(d < indices.length -1)
				ar = (Array) val;
		}
		return (Type) val;
	}

	public static TransactionReceipt waitForTransactionReceipt(Web3j web3j, String txHash, long waitMsBetweenTries, int tries) throws IOException {
		try {
			return waitForTransactionReceipt(web3j, txHash, waitMsBetweenTries, tries, false);
		}
		catch(InterruptedException e){
			log.error("waitForTransactionReceipt threw InterruptedException despite throwInterruptedException = false. This shouldnt happen.");
			throw new RuntimeException(e);
		}
	}

	/**
	 *
	 * @param web3j
	 * @param txHash
	 * @param waitMsBetweenTries
	 * @param tries
	 * @param throwInterruptedException
	 * @return the TransactionReceipt, or null if none was found in allotted time
	 * @throws InterruptedException
	 * @throws IOException
	 */
	public static TransactionReceipt waitForTransactionReceipt(Web3j web3j, String txHash, long waitMsBetweenTries, int tries, boolean throwInterruptedException) throws InterruptedException, IOException {
		TransactionReceipt receipt = null;
		int retry = 0;
		while (receipt == null && retry < tries) {
			receipt = web3j.ethGetTransactionReceipt(txHash).send().getResult();
			if (receipt == null) {
				retry++;
				log.info("Couldn't get transaction receipt for tx " + txHash + ". Retry " + retry);
				try {
					Thread.sleep(waitMsBetweenTries);
				} catch (InterruptedException e) {
					log.info(e.getMessage());
					if(throwInterruptedException){
						throw e;
					}
				}
			}
		}
		return receipt;
	}

	/**
	 *
	 * get a public field in Ethereum contract. Returns an Object of the type that is wrapped by Type specified in fieldType.
	 *
	 * For example:
	 *
	 * if contract contains:
	 * address public owner;
	 *
	 * then
	 * getPublicField(web3j, contractAddress, "owner", Address.class) should return a String with the owner address
	 *
	 * if contract contains:
	 * uint public somenum;
	 *
	 * then
	 * getPublicField(web3j, contractAddress, "somenum", Uint.class) should return a BigInteger with the value of somenum
	 *
	 *
	 * @param web3j
	 * @param contractAddress
	 * @param fieldName
	 * @param fieldType
	 * @return
	 * @throws IOException
	 */
	public static Object getPublicField(Web3j web3j, String contractAddress, String fieldName, Class<Type> fieldType) throws IOException {
		Function getOperator = new Function(fieldName, Arrays.<Type>asList(), Arrays.<TypeReference<?>>asList(TypeReference.create(fieldType)));
		EthCall response = web3j.ethCall(
			Transaction.createEthCallTransaction(contractAddress, contractAddress, FunctionEncoder.encode(getOperator)),
			DefaultBlockParameterName.LATEST).send();
		Response.Error err = response.getError();
		if (err != null) {
			throw new RuntimeException(err.getMessage());
		}
		List<Type> rslt = FunctionReturnDecoder.decode(response.getValue(), getOperator.getOutputParameters());
		return rslt.iterator().next().getValue();
	}

	/**
	 *
	 * @param web3j
	 * @param tr
	 * @return the timestamp (seconds) of the block in which trasnaction occured, or -1 if not found
	 * @throws IOException
	 */
	public static long getBlockTime(Web3j web3j, TransactionReceipt tr) throws IOException {
		DefaultBlockParameter dbp = DefaultBlockParameter.valueOf(tr.getBlockNumber());
		EthBlock eb = web3j.ethGetBlockByNumber(dbp, false).send();
		if(eb == null){
			log.error("Error fetching block "+dbp);
			return -1;
		}
		if(eb.hasError()) {
			log.error("Error fetching block "+dbp+  ". Error = "+eb.getError());
			return -1;
		}
		long ts = eb.getBlock().getTimestamp().longValue();
		log.info("getBlockTime txHash: "+tr.getTransactionHash()+ " block number: "+tr.getBlockNumber()+ " timestamp: "+ts);
		return ts;
	}



	/**
	 * @param web3j
	 * @param erc20address   address of ERC20 or 0x0 for ETH balance
	 * @param holderAddress
	 * @return token balance in wei
	 * @throws ExecutionException
	 * @throws InterruptedException
	 */
	public static BigInteger getERC20Balance(Web3j web3j, String erc20address, String holderAddress) throws ExecutionException, InterruptedException {
		Address tokenAddress = new Address(erc20address);
		if (tokenAddress.toUint160().getValue().equals(BigInteger.ZERO)) {
			EthGetBalance ethGetBalance = web3j
				.ethGetBalance(holderAddress, DefaultBlockParameterName.LATEST)
				.sendAsync()
				.get();
			final BigInteger balance = ethGetBalance.getBalance();
			return balance;
		}
		//    function balanceOf(address tokenOwner) public view returns (uint balance);
		Function balanceOf = new Function("balanceOf", Arrays.<Type>asList(new Address(holderAddress)), Arrays.<TypeReference<?>>asList(TypeReference.create(Uint.class)));
		EthCall response = web3j.ethCall(
			Transaction.createEthCallTransaction(holderAddress, erc20address, FunctionEncoder.encode(balanceOf)),
			DefaultBlockParameterName.LATEST).sendAsync().get();
		Response.Error err = response.getError();
		if (err != null) {
			throw new RuntimeException(err.getMessage());
		}
		List<Type> rslt = FunctionReturnDecoder.decode(response.getValue(), balanceOf.getOutputParameters());
		return ((Uint) rslt.iterator().next()).getValue();
	}
}
