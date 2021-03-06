package com.unifina.signalpath.blockchain

import com.google.gson.Gson
import com.unifina.ModuleTestingSpecification
import com.unifina.data.FeedEvent
import com.unifina.datasource.DataSource
import com.unifina.domain.security.IntegrationKey
import com.unifina.domain.security.SecUser
import com.unifina.domain.signalpath.Canvas
import com.unifina.domain.signalpath.Module
import com.unifina.service.EthereumIntegrationKeyService
import com.unifina.signalpath.SignalPath
import com.unifina.utils.Globals
import com.unifina.utils.GlobalsFactory
import grails.converters.JSON
import grails.test.mixin.Mock
import org.web3j.abi.FunctionEncoder
import org.web3j.abi.datatypes.DynamicArray
import org.web3j.abi.datatypes.Uint
import org.web3j.protocol.Web3j
import org.web3j.protocol.core.DefaultBlockParameterName
import org.web3j.protocol.core.Request
import org.web3j.protocol.core.methods.request.Transaction
import org.web3j.protocol.core.methods.response.EthCall
import org.web3j.protocol.core.methods.response.EthGetTransactionCount
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt
import org.web3j.protocol.core.methods.response.EthSendTransaction
import org.web3j.protocol.core.methods.response.TransactionReceipt
import org.web3j.protocol.core.methods.response.EthTransaction

import java.util.concurrent.CompletableFuture
import java.util.function.Consumer

@Mock([Canvas, Module,IntegrationKey, SecUser])
class SendEthereumTransactionSpec extends ModuleTestingSpecification {
	public static final String TXHASH = "0x123";
	public static final int CONSTANT_CALL_ARRAY_CONTENT = 13;
	public static final long TEST_BLOCKNUM = 1234;
	public static final long TEST_GASPRICE = 45;
	public static final long TEST_GASUSED = 456;
//	public static final long TEST_VALUESENT = 12;
	public static final long TEST_NONCE = 133;



	SendEthereumTransaction module

	/**
	 *
	 * @return raw function call result
	 */
	String getFnResponse(){
		//encode a uint[] response containing CONSTANT_CALL_ARRAY_CONTENT
		DynamicArray array = new DynamicArray<Uint>(new Uint(CONSTANT_CALL_ARRAY_CONTENT));
		//encodeConstructor can also be used to encode function output
		String enc = FunctionEncoder.encodeConstructor([array])
		return enc;
	}

	Globals mockGlobals(Map context=[:], SecUser user = new SecUser(username: 'user', timezone: "UTC")) {
		Globals globals = GlobalsFactory.createInstance(context, user)
		globals.setDataSource(mockDatasource)
		globals.init()
		globals.isRealtime() >> true
		globals.time = new Date(0)
		return globals
	}

	def setup() {
		// mock the key for ethereum account
		SecUser user = new SecUser(name: "name", username: "name@name.com", password: "pass").save(failOnError: true, validate: false)
		IntegrationKey key = new IntegrationKey(service: IntegrationKey.Service.ETHEREUM, name: "test key", json: '{"privateKey":"0x5e98cce00cff5dea6b454889f359a4ec06b9fa6b88e9d69b86de8e1c81887da0","address":"0x1234"}', user: user, idInService: "0x1234")
		key.id = "sgKjr1eHQpqTmwz3vK3DqwUK1wFlrfRJa9mnf_xTeFJQ"
		key.save(failOnError: true, validate: true)
		mockBean(EthereumIntegrationKeyService.class, Stub(EthereumIntegrationKeyService) {
			getAllPrivateKeysForUser(user) >> [key];
			decryptPrivateKey(_) >> {k ->
				Map json = JSON.parse(k[0].json)
				return (String) json.privateKey;
			}
		})


		module = new SendEthereumTransaction() {
			@Override
			Web3j getWeb3j() {
				return mockWeb3j;
			}
			@Override
			public void setDomainObject(Module domainObject) {}

			@Override
			public void sendOutput(SendEthereumTransaction.FunctionCallResult rslt) throws IOException, ClassNotFoundException {
				super.sendOutput(rslt);
			}
			@Override
			protected long getBlockTimeSeconds(TransactionReceipt tr) throws IOException {
				return System.currentTimeMillis()/1000;
			}
		}
		module.globals = mockGlobals([:], user)
//		module.globals = mockGlobals
		module.init()
		module.configure(applyConfig)
		def signalPath = new SignalPath(true)
		signalPath.setCanvas(new Canvas())
		module.setParentSignalPath(signalPath)
	}

	/** Mocked event queue. Works manually in tests, please call module.receive(queuedEvent) */
	def mockDatasource= Stub(DataSource) {
		enqueueEvent(_) >> { feedEvent ->
			functionCallResult = feedEvent[0]
		}
	}

	// temporary storage for async transaction generated by AbstractHttpModule, passing from globals to mockClient
	FeedEvent functionCallResult
	org.web3j.protocol.core.methods.response.Log ll = new org.web3j.protocol.core.methods.response.Log();



	def logList = [ll]
	def mockWeb3j = Stub(Web3j) {
		ethCall(_,_) >> { Transaction tx2, DefaultBlockParameterName latest ->
			return new Request(){
				public EthCall send() throws IOException {
					return new EthCall(){
						@Override
						public String getValue(){
							return getFnResponse();
						}
					};
				}
				public CompletableFuture sendAsync() {
					return new CompletableFuture(){
						@Override
						CompletableFuture thenAccept(Consumer<? super EthSendTransaction> consumer){
							EthSendTransaction tx = new EthSendTransaction() {
								@Override
								public String getTransactionHash() {
									return TXHASH;
								}
							}
							consumer.accept(tx);
						}
					}
				}
			};
		}

		ethGetTransactionReceipt(_) >> Stub(Request) {
			send() >> Stub(EthGetTransactionReceipt) {
				getResult() >> Stub(TransactionReceipt) {
					getLogs() >> logList;

					getBlockNumber() >> new BigInteger(TEST_BLOCKNUM);
					getGasUsed() >> new BigInteger(TEST_GASUSED);


				}
			}
		}

		ethGetTransactionByHash(_) >> Stub(Request) {
			send() >> Stub(EthTransaction) {
				getResult() >> Stub(org.web3j.protocol.core.methods.response.Transaction) {
					getGasPrice() >> new BigInteger(TEST_GASPRICE)

					getValue() >> new BigInteger(5).multiply(BigInteger.TEN.pow(18));

					getNonce() >> new BigInteger(TEST_NONCE)
				}
			}
		}

		ethGetTransactionCount(_, _) >> { String address, DefaultBlockParameterName latest ->
			return new Request(){
				public EthGetTransactionCount send() throws IOException {
					return new EthGetTransactionCount(){
						@Override
						public BigInteger getTransactionCount(){
							return 1;
						}
					};
				}
			};
		}
		ethSendRawTransaction(_) >> { String bytesHex ->
			return new Request(){
				public EthSendTransaction send() throws IOException {
					return new EthSendTransaction(){
						@Override
						public String getTransactionHash(){
							return TXHASH;
						}
					};
				}
				public CompletableFuture sendAsync() {
					return new CompletableFuture(){
						@Override
						CompletableFuture thenAccept(Consumer<? super EthSendTransaction> consumer){
							EthSendTransaction tx = new EthSendTransaction() {
								@Override
								public String getTransactionHash() {
									return TXHASH;
								}

							}
							consumer.accept(tx);
						}
					}
				}
			};
		}

		// helpers for handy mocking of different responses within same test
		def responseI = [].iterator()
	}

	static Map applyConfig = new Gson().fromJson('''
{

  "outputs": [
    {
      "connected": true,
      "name": "errors",
      "canConnect": true,
      "id": "ep_P3GiGglLSYalVojWpyvG3Q",
      "type": "List",
      "export": false,
      "longName": "EthereumSend.errors"
    },
    {
      "connected": true,
      "name": "out",
      "canConnect": true,
      "id": "ep__t9VKixtTMaF-1te8c5Byw",
      "type": "List",
      "export": false,
      "longName": "EthereumSend.out"
    }
  ],
  "layout": {
    "position": {
      "top": "105px",
      "left": "436px"
    }
  },
  "inputs": [
    {
      "sourceId": "ep_2Y1qp6qnS1y7hvrObQGPAg",
      "canToggleDrivingInput": false,
      "drivingInput": false,
      "type": "EthereumContract",
      "connected": true,
      "requiresConnection": true,
      "name": "contract",
      "canConnect": true,
      "id": "ep_nxUlNHzjRKOwGNWg-px1UQ",
      "jsClass": "EthereumContractInput",
      "acceptedTypes": [
        "EthereumContract"
      ],
      "export": false,
      "value": {
        "address": "0x338090c5492c5c5e41a4458f5fc4b205cbc54a24",
        "abi": [
          {
            "outputs": [
              {
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": true,
            "inputs": [
              {
                "name": "a",
                "type": "uint256"
              }
            ],
            "name": "testTxOutput",
            "type": "function"
          },
          {
            "outputs": [
              {
                "name": "out",
                "type": "uint256[]"
              }
            ],
            "constant": true,
            "payable": false,
            "inputs": [
              {
                "name": "a",
                "type": "uint256"
              }
            ],
            "name": "testOutput1D",
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "indexed": false,
                "name": "poster",
                "type": "address"
              },
              {
                "indexed": false,
                "name": "data",
                "type": "string"
              }
            ],
            "name": "testEvent",
            "anonymous": false,
            "type": "event"
          }
        ]
      },
      "longName": "EthereumSend.contract"
    },
    {
      "sourceId": "ep_2jaahlX3Ty6AeQQIbsV4XA",
      "canToggleDrivingInput": true,
      "drivingInput": true,
      "type": "Double",
      "connected": true,
      "requiresConnection": true,
      "name": "a",
      "canConnect": true,
      "id": "ep_YJHJEL4pRUqLusUtyQdLlA",
      "acceptedTypes": [
        "Double"
      ],
      "canHaveInitialValue": true,
      "export": false,
      "initialValue": 123,
      "longName": "EthereumSend.a"
    },
    {
      "sourceId": "ep_2jaahlX3Ty6AeQQIbsV4XB",
      "canToggleDrivingInput": true,
      "drivingInput": true,
      "type": "Double",
      "connected": true,
      "requiresConnection": true,
      "name": "ether",
      "canConnect": true,
      "id": "ep_YJHJEL4pRUqLusUtyQdLlA",
      "acceptedTypes": [
        "Double"
      ],
      "canHaveInitialValue": true,
      "export": false,
      "initialValue": 5,
      "longName": "EthereumSend.ether"
    }
  ],
  "name": "EthereumSend",
  "options": {
    "gasPriceGWei": {
      "type": "double",
      "value": 20
    },
    "activateInHistoricalMode": {
      "type": "boolean",
      "value": false
    },
    "network": {
      "possibleValues": [
        {
          "text": "local",
          "value": "local"
        }
      ],
      "type": "string",
      "value": "local"
    }
  },
  "canRefresh": false,
  "id": 1150,
  "params": [
    {
        "canConnect": false,
        "updateOnChange": true,
        "export": false,
        "possibleValues": [
        {
            "name": "(none)",
            "value": null
        },
        {
            "name": "acco 1",
            "value": "sgKjr1eHQpqTmwz3vK3DqwUK1wFlrfRJa9mnf_xTeFJQ"
        }],
        "connected": false,
        "type": "String",
        "requiresConnection": false,
        "canToggleDrivingInput": true,
        "id": "ep_5RFpE2iKTPawMMKNx0ty8Q",
        "name": "ethAccount",
        "drivingInput": false,
        "value": "sgKjr1eHQpqTmwz3vK3DqwUK1wFlrfRJa9mnf_xTeFJQ",
        "longName": "SolidityModule.ethAccount",
        "defaultValue": null,
        "acceptedTypes": ["String"]
    },
    {
      "possibleValues": [
        {
          "name": "testTxOutput",
          "value": "testTxOutput"
        },
        {
          "name": "testOutput1D",
          "value": "testOutput1D"
        }
      ],
      "canToggleDrivingInput": true,
      "defaultValue": "",
      "drivingInput": false,
      "type": "String",
      "connected": false,
      "updateOnChange": true,
      "requiresConnection": false,
      "name": "function",
      "isTextArea": false,
      "canConnect": true,
      "id": "ep_81s3PcBETUawfxcvt1DhMQ",
      "acceptedTypes": [
        "String"
      ],
      "export": false,
      "value": "testOutput1D",
      "longName": "EthereumSend.function"
    }
  ],
  "jsModule": "GenericModule",
  "type": "module",
  "canClearState": true,
  "hash": 3
}
''', Map.class)

	void "test constant function call"() {
		applyConfig.params[1].value = "testOutput1D"
		module.configure(applyConfig)
		module.activateWithSideEffects()
		module.receive(functionCallResult)
		def rslt = module.getOutput("out").getValue();
		expect:
		rslt instanceof List
		rslt[0] == CONSTANT_CALL_ARRAY_CONTENT.toString()
		//rslt[0] == CONSTANT_CALL_ARRAY_CONTENT.toString()
	}

	void "test tx function call"() {
		ll.setTopics(["testtopic"])
		def inputs = [trigger: true]
		def outputs = [errors: []]
		applyConfig.params[1].value = "testTxOutput"
		module.configure(applyConfig)
		module.activateWithSideEffects()
		module.receive(functionCallResult)
		def rslt = module.getOutput("out").getValue();
		expect:
		module.getOutput("txHash").getValue().equals(TXHASH);
		module.getOutput("gasUsed").getValue() == TEST_GASUSED;
		module.getOutput("gasPriceWei").getValue() == TEST_GASPRICE;
		module.getOutput("blockNumber").getValue()== TEST_BLOCKNUM;
		module.getOutput("nonce").getValue() == TEST_NONCE;
		module.getOutput("spentEth").getValue() == 5;
		((SendEthereumTransaction.TransactionResult) functionCallResult.content).getTransactionReceipt().getLogs().get(0).getTopics().get(0).equals("testtopic")
	}

}
