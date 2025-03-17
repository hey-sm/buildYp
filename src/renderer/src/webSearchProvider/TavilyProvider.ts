import { TavilyClient } from '@agentic/tavily'  // 用于与 Tavily API 进行交互。
import { WebSearchProvider, WebSearchResponse } from '@renderer/types'  // 定义了 Web 1搜索提供者的类型,2返回结果的类型。

import BaseWebSearchProvider from './BaseWebSearchProvider'  //  基础的 Web 搜索提供者类，提供了通用的搜索逻辑。

export default class TavilyProvider extends BaseWebSearchProvider {
  private tvly: TavilyClient

  constructor(provider: WebSearchProvider) {
    super(provider)
    if (!provider.apiKey) {
      throw new Error('API key is required for Tavily provider')
    }
    this.tvly = new TavilyClient({ apiKey: provider.apiKey })
  }


  /**
   * 
   * @param query: string: 搜索查询字符串。
    *@param maxResults: number: 最大返回结果数量。
    *@param excludeDomains: string[]: 需要排除的域名列表。
   * @returns 
   */
  public async search(query: string, maxResults: number, excludeDomains: string[]): Promise<WebSearchResponse> {
    try {
      if (!query.trim()) {
        throw new Error('Search query cannot be empty')
      }

      const result = await this.tvly.search({
        query,
        max_results: Math.max(1, maxResults),
        exclude_domains: excludeDomains || []
      })

      console.log("第三步-4：根据WebSearchProviderFactory调用Tavily提供商的搜索方法开始")
      return {
        query: result.query,
        results: result.results.map((result) => ({
          title: result.title || 'No title',
          content: result.content || '',
          url: result.url || ''
        }))
      }
    } catch (error) {
      console.error('Tavily search failed:', error)
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
