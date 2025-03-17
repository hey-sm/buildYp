import { WebSearchProvider, WebSearchResponse } from '@renderer/types'

import BaseWebSearchProvider from './BaseWebSearchProvider'
import WebSearchProviderFactory from './WebSearchProviderFactory'

export default class WebSearchEngineProvider {
  private sdk: BaseWebSearchProvider
  constructor(provider: WebSearchProvider) {
    console.log("第三步-3：创建具体的搜索提供商实例")
    // 关键点：通过工厂创建具体的搜索提供商实例
    console.log(provider)
    this.sdk = WebSearchProviderFactory.create(provider)
  }
  public async search(query: string, maxResult: number, excludeDomains: string[]): Promise<WebSearchResponse> {
    console.log("第三步-3：调用具体提供商的搜索方法开始query", query)
    console.log("第三步-3：调用具体提供商的搜索方法开始maxResult", maxResult)
    console.log("第三步-3：调用具体提供商的搜索方法开始excludeDomains", excludeDomains)
    return await this.sdk.search(query, maxResult, excludeDomains)
  }
}
