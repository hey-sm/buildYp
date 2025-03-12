import { CloseOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { Button } from 'antd'
import { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

interface ToolPageLayoutProps {
  title: string
  children?: ReactNode
}

const ToolPageLayout: FC<ToolPageLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate()

  const handleClose = () => {
    navigate('/xhs')
  }

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>
          {title}
          <ButtonGroup className="no-drag">
            <StyledButton onClick={handleClose}>
              <CloseOutlined />
            </StyledButton>
          </ButtonGroup>
        </NavbarCenter>
      </Navbar>
      <ContentContainer>{children}</ContentContainer>
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
  padding: 20px;
  overflow-y: auto;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
`

const StyledButton = styled(Button)`
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text);

  &:hover {
    background-color: var(--color-fill-secondary);
  }

  &.pinned {
    color: var(--color-primary);
  }
`

export default ToolPageLayout
