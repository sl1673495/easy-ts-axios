import { CancelExecutor, CancelTokenSource, Canceler } from '../types'
import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: Cancel): void
}

export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise

    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })

    const cancel: Canceler = message => {
      if (this.reason) {
        return
      }
      // 实例Cancel 用来给axios.isCancel判断
      this.reason = new Cancel(message)
      // 这边resolve了promise
      // xhr那边注册的then回调函数就会执行
      // 会abort掉xhr
      resolvePromise(this.reason)
    }

    executor(cancel)
  }

  throwIfRequested() {
    if (this.reason) {
      throw this.reason
    }
  }

  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })

    return {
      cancel,
      token
    }
  }
}
