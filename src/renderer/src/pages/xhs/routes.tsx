import { Center } from '@renderer/components/Layout'
import { Spin } from 'antd'
import { lazy, Suspense } from 'react'
import { Route } from 'react-router-dom'

// 懒加载组件，添加延迟以测试加载效果
const XhsPage = lazy(() => import('./XhsPage'))
const DemandAnalysis = lazy(() => import('./toolPage/DemandAnalysis'))
const BrandDiagnosis = lazy(() => import('./toolPage/BrandDiagnosis'))
const KolAssistant = lazy(() => import('./toolPage/KolAssistant'))
const Dandelion = lazy(() => import('./toolPage/Dandelion'))
const StarMap = lazy(() => import('./toolPage/StarMap'))
const Copywriting = lazy(() => import('./toolPage/Copywriting'))
const CommentManager = lazy(() => import('./toolPage/CommentManager'))
const CommentHero = lazy(() => import('./toolPage/CommentHero'))
const Report = lazy(() => import('./toolPage/Report'))

// 加载占位组件
const LoadingFallback = () => (
  <Center style={{ height: '100%' }}>
    <Spin size="large" tip="Loading..." />
  </Center>
)

// 包装懒加载组件
const LazyWrapper = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
)

export const XhsRoutes = (
  <>
    <Route path="/xhs" element={LazyWrapper(XhsPage)} />
    <Route path="/xhs/demand-analysis" element={LazyWrapper(DemandAnalysis)} />
    <Route path="/xhs/brand-diagnosis" element={LazyWrapper(BrandDiagnosis)} />
    <Route path="/xhs/kol-assistant" element={LazyWrapper(KolAssistant)} />
    <Route path="/xhs/dandelion" element={LazyWrapper(Dandelion)} />
    <Route path="/xhs/star-map" element={LazyWrapper(StarMap)} />
    <Route path="/xhs/copywriting" element={LazyWrapper(Copywriting)} />
    <Route path="/xhs/comment-manager" element={LazyWrapper(CommentManager)} />
    <Route path="/xhs/comment-hero" element={LazyWrapper(CommentHero)} />
    <Route path="/xhs/report" element={LazyWrapper(Report)} />
  </>
)
