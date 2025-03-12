import styled from 'styled-components'

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 12px;
  }
`

// 图标列表
const ICON_NAMES = [
  'CommentHero',
  'DemandAnalysis',
  'BrandDiagnosis',
  'KolAssistant',
  'Dandelion',
  'StarMap',
  'Copywriting',
  'CommentManager',
  'Report'
] as const

// 动态导入指定的图标
const icons = import.meta.glob('../../../assets/images/xhs/*.svg', {
  eager: true,
  import: 'default'
}) as Record<string, string>

// 使用对象统一导出所有图标组件
export const Icons = {
  ...Object.fromEntries(
    ICON_NAMES.map((name) => [
      name,
      () => (
        <IconWrapper>
          <img src={icons[`../../../assets/images/xhs/${name}.svg`]} alt={name.toLowerCase()} />
        </IconWrapper>
      )
    ])
  )
} as const

// 导出类型
export type IconName = (typeof ICON_NAMES)[number]
