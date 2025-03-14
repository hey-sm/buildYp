import { SearchOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { Center } from '@renderer/components/Layout'
import { Empty, Input } from 'antd'
import { isEmpty } from 'lodash'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { Icons } from './components/Icons'
import Tool from './components/Tool'

const XhsPage: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const tools = [
    {
      id: 'comment-hero',
      title: '红书评论侠',
      icon: <Icons.CommentHero />,
      path: '/xhs/comment-hero'
    },
    {
      id: 'dandelion-quote',
      title: '蒲公英报价信息',
      icon: <Icons.DandelionQuote />,
      path: '/xhs/dandelion-quote'
    },
    {
      id: 'demand-analysis',
      title: '客户需求分析师',
      icon: <Icons.DemandAnalysis />,
      path: '/xhs/demand-analysis'
    },
    {
      id: 'brand-diagnosis',
      title: '客户品牌诊断',
      icon: <Icons.DemandAnalysis />,
      path: '/xhs/brand-diagnosis'
    },
    {
      id: 'kol-assistant',
      title: '达人推手',
      icon: <Icons.KolAssistant />,
      path: '/xhs/kol-assistant'
    },
    {
      id: 'dandelion',
      title: '蒲公英关单王',
      icon: <Icons.Dandelion />,
      path: '/xhs/dandelion'
    },
    {
      id: 'star-map',
      title: '星图关单王',
      icon: <Icons.StarMap />,
      path: '/xhs/star-map'
    },
    {
      id: 'copywriting',
      title: '文案超人',
      icon: <Icons.Copywriting />,
      path: '/xhs/copywriting'
    },
    {
      id: 'comment-manager',
      title: '智能评论维护',
      icon: <Icons.CommentManager />,
      path: '/xhs/comment-manager'
    },
    {
      id: 'report',
      title: '红书结案报告',
      icon: <Icons.Report />,
      path: '/xhs/report'
    }
  ]

  const filteredTools = search ? tools.filter((tool) => tool.title.toLowerCase().includes(search.toLowerCase())) : tools

  // 计算网格布局
  const itemsPerRow = Math.floor(930 / 115)
  const rowCount = Math.ceil(filteredTools.length / itemsPerRow)
  const containerHeight = rowCount * 85 + (rowCount - 1) * 25

  const handleToolClick = (tool: (typeof tools)[0]) => {
    navigate(tool.path)
  }

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none', justifyContent: 'space-between' }}>
          {t('xhs.title')}
          <Input
            placeholder={t('common.search')}
            className="nodrag"
            style={{ width: '30%', height: 28 }}
            size="small"
            variant="filled"
            suffix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ width: 80 }} />
        </NavbarCenter>
      </Navbar>
      <ContentContainer id="content-container">
        <ToolsContainer style={{ height: containerHeight }}>
          {filteredTools.map((tool) => (
            <Tool key={tool.id} tool={tool} onClick={() => handleToolClick(tool)} />
          ))}
          {isEmpty(filteredTools) && (
            <Center style={{ flex: 1 }}>
              <Empty />
            </Center>
          )}
        </ToolsContainer>
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: center;
  height: 100%;
  overflow-y: auto;
  padding: 50px;
`

const ToolsContainer = styled.div`
  display: grid;
  min-width: 0;
  max-width: 930px;
  width: 100%;
  grid-template-columns: repeat(auto-fill, 90px);
  gap: 25px;
  justify-content: center;
`

export default XhsPage
