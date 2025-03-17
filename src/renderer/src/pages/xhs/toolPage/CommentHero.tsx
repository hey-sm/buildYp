import { FC, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ToolPageLayout from '../components/ToolPageLayout'

declare global {
  interface Window {
    CozeWebSDK: any
  }
}

const CommentHero: FC = () => {
  const chatRef = useRef<HTMLDivElement>(null)
  const cozeWebSDKRef = useRef<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // 初始化 SDK
    initializeCozeWebSDK()

    // 组件卸载时清理
    return () => {
      destroyCozeWebSDK()
    }
  }, [])

  const initializeCozeWebSDK = () => {
    if (!chatRef.current) return

    cozeWebSDKRef.current = new window.CozeWebSDK.WebChatClient({
      config: { bot_id: '7451442415795683343' },
      componentProps: { title: '红书评论侠' },
      userInfo: {
        id: '12345',
        url: 'https://lf-coze-web-cdn.coze.cn/obj/coze-web-cn/obric/coze/favicon.1970.png',
        nickname: 'User'
      },
      ui: {
        base: {
          icon: 'https://files.eshypdata.com/xhs512.png',
          layout: 'mobile',
          zIndex: 1000
        },
        header: {
          isShow: false,
          isNeedClose: false
        },
        asstBtn: {
          isNeed: false
        },
        chatBot: {
          el: chatRef.current,
          onBeforeHide: () => {
            navigate('/xhs')
          }
        }
      }
    })

    cozeWebSDKRef.current.showChatBot()
  }

  const destroyCozeWebSDK = () => {
    if (cozeWebSDKRef.current) {
      cozeWebSDKRef.current.hideChatBot()
      cozeWebSDKRef.current = null
    }
  }

  return (
    <ToolPageLayout title="红书评论侠">
      <ChatContainer ref={chatRef} />
    </ToolPageLayout>
  )
}
const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
`
export default CommentHero
