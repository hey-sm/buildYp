// 导入状态管理库及相关类型
import store from '@renderer/store'
// 导入设置启用状态和最大结果数的动作创建器
import { setEnabled, setMaxResults } from '@renderer/store/xhsSearch'
// 导入小红书搜索响应类型
import { XhsSearchResponse } from '@renderer/types'

/**
 * 定义小红书搜索状态接口
 */
interface XhsSearchState {
  // 是否启用小红书搜索
  enabled: boolean
  // 搜索结果的最大数量
  maxResults: number
}

/**
 * 提供小红书搜索相关功能的服务类
 */
class XhsSearchService {
  /**
   * 获取当前存储的小红书搜索状态
   * @private
   * @returns 小红书搜索状态
   */
  private getXhsSearchState(): XhsSearchState {
    return store.getState().xhsSearch
  }

  /**
   * 检查小红书搜索功能是否启用
   * @public
   * @returns 如果小红书搜索已启用则返回true，否则返回false
   */
  public isXhsSearchEnabled(): boolean {
    return this.getXhsSearchState().enabled
  }

  /**
   * 设置小红书搜索启用状态
   * @public
   * @param enabled 是否启用
   */
  public setXhsSearchEnabled(enabled: boolean): void {
    store.dispatch(setEnabled(enabled))
  }


  /**
   * 执行小红书搜索
   * @public
   * @param query 搜索查询
   * @returns 搜索响应
   */
  public async search(query: string): Promise<XhsSearchResponse> {


    const { maxResults } = this.getXhsSearchState()

    if (!this.isXhsSearchEnabled()) {
      console.warn('小红书搜索未启用')
      return { results: [] }
    } else {
      console.log('小红书搜索已启用了：', query)
    }


    try {
      const response = await fetch('http://rtoolapi.eshypdata.com/ai/xhs_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({
          oa_id: '123',
          type: '图文',
          keywords: query
        })
      })
      if (!response.ok) {
        console.log('小红书搜索接口错误 :')
        throw new Error(`小红书搜索接口错误: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("第三步小红书搜索结果：", result)

      if (result.code === 0) {
        return {
          results: result.data
            .slice(0, maxResults)
            .map(note => ({
              title: note.title || note.content,
              url: note.sourceUrl,
              //content: `作者：${note.kol_name} | 获赞：${note.likes} | 笔记：${note.content}`,
              content: note.content || note.title, // 如果 note.content 为空，则使用 note.title,
              source: 'xiaohongshu'
            }))
        }
      } else {
        console.error('小红书搜索返回错误代码:', result.code)
        return { results: [] }
      }
    } catch (error) {
      console.log('小红书搜索调用异常 :', error)
      return { results: [] }
    }
  }

  /**
   * 检查小红书搜索服务是否正常工作
   * @public
   * @returns 如果服务可用返回true，否则返回false
   */
  public async checkSearch(): Promise<{ valid: boolean; error?: any }> {
    try {
      const response = await this.search('test query')
      return { valid: response.results.length > 0, error: undefined }
    } catch (error) {
      return { valid: false, error }
    }
  }
}

export default new XhsSearchService()