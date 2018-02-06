
import { configure } from 'enzyme'
import moxios from 'moxios'
import Adapter from 'enzyme-adapter-react-16'

configure({
    adapter: new Adapter()
})

window.requestAnimationFrame = (callback) => {
    setTimeout(callback, 0)
}

moxios.promiseWait = () => new Promise((resolve) => {
    moxios.wait(resolve)
})