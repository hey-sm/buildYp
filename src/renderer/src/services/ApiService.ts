import { getOpenAIWebSearchParams } from '@renderer/config/models'
import i18n from '@renderer/i18n'
import store from '@renderer/store'
import { setGenerating } from '@renderer/store/runtime'
import { Assistant, Message, Model, Provider, Suggestion } from '@renderer/types'
import { addAbortController } from '@renderer/utils/abortController'
import { formatMessageError } from '@renderer/utils/error'
import { cloneDeep, findLast, isEmpty } from 'lodash'

import AiProvider from '../providers/AiProvider'
import {
  getAssistantProvider,
  getDefaultModel,
  getProviderByModel,
  getTopNamingModel,
  getTranslateModel
} from './AssistantService'
import { EVENT_NAMES, EventEmitter } from './EventService'
import { filterMessages, filterUsefulMessages } from './MessagesService'
import { estimateMessagesUsage } from './TokenService'
import WebSearchService from './WebSearchService'

export async function fetchChatCompletion({
  message,
  messages,
  assistant,
  onResponse
}: {
  message: Message
  messages: Message[]
  assistant: Assistant
  onResponse: (message: Message) => void
}) {
  window.keyv.set(EVENT_NAMES.CHAT_COMPLETION_PAUSED, false)

  const provider = getAssistantProvider(assistant)
  const webSearchProvider = WebSearchService.getWebSearchProvider()
  const AI = new AiProvider(provider)

  store.dispatch(setGenerating(true))

  onResponse({ ...message })

  const pauseFn = (message: Message) => {
    message.status = 'paused'
    EventEmitter.emit(EVENT_NAMES.RECEIVE_MESSAGE, message)
    store.dispatch(setGenerating(false))
    onResponse({ ...message, status: 'paused' })
  }

  addAbortController(message.askId ?? message.id, pauseFn.bind(null, message))

  try {
    let _messages: Message[] = []
    let isFirstChunk = true

    // Search web
    // 1检查全局配置是否启用了 Web 搜索功能。 2检查当前助手（Assistant）是否支持 Web 搜索。  3确保当前助手有有效的模型（Model）
    if (WebSearchService.isWebSearchEnabled() && assistant.enableWebSearch && assistant.model) {
      console.log("第三步，主要处理网络搜索得逻辑：匹配网络搜索提供商并返回结果")
      // 这是一个辅助函数，用于根据助手和模型获取 Web 搜索所需的参数。
      const webSearchParams = getOpenAIWebSearchParams(assistant, assistant.model)
      if (isEmpty(webSearchParams)) {
        const lastMessage = findLast(messages, (m) => m.role === 'user')
        const hasKnowledgeBase = !isEmpty(lastMessage?.knowledgeBaseIds)
        if (lastMessage) {
          if (hasKnowledgeBase) {
            window.message.info({
              content: i18n.t('message.ignore.knowledge.base'),
              key: 'knowledge-base-no-match-info'
            })
          }
          //  调用回调函数，通知调用方消息的状态已更新为,前端界面可以根据这个状态显示加载动画或提示信息。
          onResponse({ ...message, status: 'searching' })

          // 调用网络搜索服务：1搜索提供者，2传入搜索内容。
          const webSearch = await WebSearchService.search(webSearchProvider, lastMessage.content)
          message.metadata = {
            ...message.metadata,
            webSearch: webSearch
          }

          console.log("第三步，将搜索结果返回前端并缓存结果webSearch")
          console.log(webSearch)
          console.log("第三步，将搜索结果返回前端并缓存结果webSearch")
          window.keyv.set(`web-search-${lastMessage?.id}`, webSearch)
        }
      }
    }

    const allMCPTools = await window.api.mcp.listTools()
    console.log("第八步，调用AI大模型")
    await AI.completions({
      messages: filterUsefulMessages(messages),  // 过滤出有用的聊天消息，确保只传递相关消息给 AI 模型
      assistant, // 当前助手的相关配置和信息

      // 一个回调函数，用于接收过滤后的消息列表，并将其赋值给 _messages 变量。这有助于后续处理或调试时使用完整的消息上下文。
      onFilterMessages: (messages) => (_messages = messages), 


      // 一个回调函数，用于处理 AI 模型每次返回的文本片段（chunk）。
      // 每当模型返回一部分文本时，都会调用这个回调函数来更新消息的内容和元数据。
      onChunk: ({ text, reasoning_content, usage, metrics, search, citations, mcpToolResponse }) => {
        message.content = message.content + text || ''
        message.usage = usage
        message.metrics = metrics

        if (reasoning_content) {
          message.reasoning_content = (message.reasoning_content || '') + reasoning_content
        }

        if (search) {
          message.metadata = { ...message.metadata, groundingMetadata: search }
        }

        if (mcpToolResponse) {
          message.metadata = { ...message.metadata, mcpTools: cloneDeep(mcpToolResponse) }
        }

        // Handle citations from Perplexity API
        if (isFirstChunk && citations) {
          message.metadata = {
            ...message.metadata,
            citations
          }
          isFirstChunk = false
        }

        onResponse({ ...message, status: 'pending' })
      },
      mcpTools: allMCPTools
    })


    message.status = 'success'

    if (!message.usage || !message?.usage?.completion_tokens) {
      message.usage = await estimateMessagesUsage({
        assistant,
        messages: [..._messages, message]
      })
      // Set metrics.completion_tokens
      if (message.metrics && message?.usage?.completion_tokens) {
        if (!message.metrics?.completion_tokens) {
          message.metrics.completion_tokens = message.usage.completion_tokens
        }
      }
    }
  } catch (error: any) {
    console.log('error', error)
    message.status = 'error'
    message.error = formatMessageError(error)
  }

  // Update message status
  message.status = window.keyv.get(EVENT_NAMES.CHAT_COMPLETION_PAUSED) ? 'paused' : message.status

  // Emit chat completion event
  EventEmitter.emit(EVENT_NAMES.RECEIVE_MESSAGE, message)
  onResponse(message)

  // Reset generating state
  store.dispatch(setGenerating(false))

  return message
}

interface FetchTranslateProps {
  message: Message
  assistant: Assistant
  onResponse?: (text: string) => void
}

export async function fetchTranslate({ message, assistant, onResponse }: FetchTranslateProps) {
  const model = getTranslateModel()

  if (!model) {
    throw new Error(i18n.t('error.provider_disabled'))
  }

  const provider = getProviderByModel(model)

  if (!hasApiKey(provider)) {
    throw new Error(i18n.t('error.no_api_key'))
  }

  const AI = new AiProvider(provider)

  try {
    return await AI.translate(message, assistant, onResponse)
  } catch (error: any) {
    return ''
  }
}

export async function fetchMessagesSummary({ messages, assistant }: { messages: Message[]; assistant: Assistant }) {
  const model = getTopNamingModel() || assistant.model || getDefaultModel()
  const provider = getProviderByModel(model)

  if (!hasApiKey(provider)) {
    return null
  }

  const AI = new AiProvider(provider)

  try {
    return await AI.summaries(filterMessages(messages), assistant)
  } catch (error: any) {
    return null
  }
}

export async function fetchGenerate({ prompt, content }: { prompt: string; content: string }): Promise<string> {
  const model = getDefaultModel()
  const provider = getProviderByModel(model)

  if (!hasApiKey(provider)) {
    return ''
  }

  const AI = new AiProvider(provider)

  try {
    return await AI.generateText({ prompt, content })
  } catch (error: any) {
    return ''
  }
}

export async function fetchSuggestions({
  messages,
  assistant
}: {
  messages: Message[]
  assistant: Assistant
}): Promise<Suggestion[]> {
  const model = assistant.model
  if (!model) {
    return []
  }

  if (model.owned_by !== 'graphrag') {
    return []
  }

  if (model.id.endsWith('global')) {
    return []
  }

  const provider = getAssistantProvider(assistant)
  const AI = new AiProvider(provider)

  try {
    return await AI.suggestions(filterMessages(messages), assistant)
  } catch (error: any) {
    return []
  }
}

// Helper function to validate provider's basic settings such as API key, host, and model list
export function checkApiProvider(provider: Provider): {
  valid: boolean
  error: Error | null
} {
  const key = 'api-check'
  const style = { marginTop: '3vh' }

  if (provider.id !== 'ollama' && provider.id !== 'lmstudio') {
    if (!provider.apiKey) {
      window.message.error({ content: i18n.t('message.error.enter.api.key'), key, style })
      return {
        valid: false,
        error: new Error(i18n.t('message.error.enter.api.key'))
      }
    }
  }

  if (!provider.apiHost) {
    window.message.error({ content: i18n.t('message.error.enter.api.host'), key, style })
    return {
      valid: false,
      error: new Error(i18n.t('message.error.enter.api.host'))
    }
  }

  if (isEmpty(provider.models)) {
    window.message.error({ content: i18n.t('message.error.enter.model'), key, style })
    return {
      valid: false,
      error: new Error(i18n.t('message.error.enter.model'))
    }
  }

  return {
    valid: true,
    error: null
  }
}

export async function checkApi(provider: Provider, model: Model) {
  const validation = checkApiProvider(provider)
  if (!validation.valid) {
    return {
      valid: validation.valid,
      error: validation.error
    }
  }

  const AI = new AiProvider(provider)

  const { valid, error } = await AI.check(model)

  return {
    valid,
    error
  }
}

function hasApiKey(provider: Provider) {
  if (!provider) return false
  if (provider.id === 'ollama' || provider.id === 'lmstudio') return true
  return !isEmpty(provider.apiKey)
}

export async function fetchModels(provider: Provider) {
  const AI = new AiProvider(provider)

  try {
    return await AI.models()
  } catch (error) {
    return []
  }
}
