import { FC } from 'react'
import styled from 'styled-components'

interface ToolType {
  id: string
  title: string
  icon: React.ReactNode
  path: string
  url?: string
}

interface Props {
  tool: ToolType
  onClick?: () => void
  size?: number
}

const Tool: FC<Props> = ({ tool, onClick }) => {
  return (
    <Container onClick={onClick}>
      <IconWrapper>{tool.icon}</IconWrapper>
      <ToolTitle>{tool.title}</ToolTitle>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
`

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`

const ToolTitle = styled.div`
  font-size: 12px;
  margin-top: 5px;
  color: var(--color-text-soft);
  text-align: center;
  user-select: none;
  white-space: nowrap;
`

export default Tool
