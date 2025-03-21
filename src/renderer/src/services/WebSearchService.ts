// 导入状态管理库及相关类型
import store from '@renderer/store'
// 导入设置默认搜索提供商的动作创建器
import { setDefaultProvider } from '@renderer/store/websearch'
// 导入网络搜索相关的类型定义
import { WebSearchProvider, WebSearchResponse } from '@renderer/types'
// 导入对象属性检查工具函数
import { hasObjectKey } from '@renderer/utils'
// 导入搜索引擎基础提供者类
import WebSearchEngineProvider from '@renderer/webSearchProvider/WebSearchEngineProvider'
// 导入日期处理库
import dayjs from 'dayjs'

/**  
 * 定义网络搜索状态接口
 */
interface WebSearchState {
  // 默认搜索提供商的ID
  defaultProvider: string
  // 所有可用的搜索提供商列表
  providers: WebSearchProvider[]
  // 是否在搜索查询中添加当前日期
  searchWithTime: boolean
  // 搜索结果的最大数量
  maxResults: number
  // 要排除的域名列表
  excludeDomains: string[]
}


/**
 * 提供网络搜索相关功能的服务类
 */
class WebSearchService {
  /**
   * 获取当前存储的网络搜索状态
   * @private
   * @returns 网络搜索状态
   */
  private getWebSearchState(): WebSearchState {
    return store.getState().websearch
  }

  /**
 * 检查网络搜索功能是否启用
   * @public
   * @returns 如果默认搜索提供商已启用则返回true，否则返回false
   */
  public isWebSearchEnabled(): boolean {
    const { defaultProvider, providers } = this.getWebSearchState()
    const provider = providers.find((provider) => provider.id === defaultProvider)

    if (!provider) {
      return false
    }

    if (hasObjectKey(provider, 'apiKey')) {
      return provider.apiKey !== ''
    }

    if (hasObjectKey(provider, 'apiHost')) {
      return provider.apiHost !== ''
    }

    return false
  }

  /**
   * 获取当前默认的网络搜索提供商
   * @public
   * @returns 网络搜索提供商
   * @throws 如果找不到默认提供商则抛出错误
   */
  public getWebSearchProvider(): WebSearchProvider {
    const { defaultProvider, providers } = this.getWebSearchState()
    let provider = providers.find((provider) => provider.id === defaultProvider)

    if (!provider) {
      provider = providers[0]
      if (provider) {
        // 可选：自动更新默认提供商
        store.dispatch(setDefaultProvider(provider.id))
      } else {
        throw new Error(`No web search providers available`)
      }
    }

    return provider
  }

  /**
   * 使用指定的提供商执行网络搜索
   * @public
   * @param provider 搜索提供商
   * @param query 搜索查询
   * @returns 搜索响应
   */
  public async search(provider: WebSearchProvider, query: string): Promise<WebSearchResponse> {
    console.log("第三步-2：使用指定的提供商执行网络搜索")

     // 1. 获取搜索配置
    const { searchWithTime, maxResults, excludeDomains } = this.getWebSearchState()

     // 2. 创建搜索引擎实例
    const webSearchEngine = new WebSearchEngineProvider(provider)

    // 3. 处理查询文本
    let formattedQuery = query
    if (searchWithTime) {
      // 添加时间信息到查询
      formattedQuery = `today is ${dayjs().format('YYYY-MM-DD')} \r\n ${query}`
    }

    try {
      // 4. 执行搜索
      return await webSearchEngine.search(formattedQuery, maxResults, excludeDomains)
    } catch (error) {
      console.error('Search failed:', error)
      return {
        results: []
      }
    }
  }

  /**
   * 检查搜索提供商是否正常工作
   * @public
   * @param provider 要检查的搜索提供商
   * @returns 如果提供商可用返回true，否则返回false
   */
  public async checkSearch(provider: WebSearchProvider): Promise<{ valid: boolean; error?: any }> {
    try {
      const response = await this.search(provider, 'test query')

      // 优化的判断条件：检查结果是否有效且没有错误
      return { valid: response.results.length > 0, error: undefined }
    } catch (error) {
      return { valid: false, error }
    }
  }
}

export default new WebSearchService()
