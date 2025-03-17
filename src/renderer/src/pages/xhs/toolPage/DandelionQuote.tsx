import { CloudUploadOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Form, Input, Tabs, Tooltip, Typography, Upload } from 'antd'
import { FC, useState } from 'react'
import styled from 'styled-components'

import ToolPageLayout from '../components/ToolPageLayout'

const { TextArea } = Input
const { Title, Text } = Typography

// 定义表头选择数据结构
interface CategoryOption {
  label: string | React.ReactNode
  value: string
}

interface CategoryData {
  category: string
  options: CategoryOption[]
}

// 表头选择数据
const headerSelectionData: CategoryData[] = [
  {
    category: '基础信息',
    options: [
      { label: '达人昵称', value: 'nickname' },
      { label: '小红书号', value: 'redid' },
      { label: '性别', value: 'gender' },
      { label: '粉丝数', value: 'fans_count' },
      { label: '地区', value: 'location' },
      { label: '所属机构', value: 'mcn' },
      { label: '商业合作领域', value: 'bussiness' }
    ]
  },
  {
    category: '报价信息',
    options: [
      { label: '图文一口价', value: 'picture_price' },
      { label: '视频一口价', value: 'video_price' },
      { label: '其他', value: 'other_price' }
    ]
  },
  {
    category: '表现数据',
    options: [
      { label: '互动中位数', value: 'mid_engage_num' },
      { label: '阅读中位数', value: 'mid_read_num' },
      { label: '近期笔记互动最高数', value: 'max_engage_num' },
      { label: '近期笔记互动最低数', value: 'min_engage_num' },
      {
        label: (
          <span>
            近10篇笔记互动过千数&nbsp;&nbsp;
            <Tooltip title="此选项会增加数据的获取时间">
              <InfoCircleOutlined />
            </Tooltip>
          </span>
        ),
        value: 'hot_num'
      }
    ]
  },
  {
    category: '标签信息',
    options: [
      { label: '内容标签', value: 'content_tag' },
      { label: '次级标签', value: 'l2_tags' }
    ]
  },
  {
    category: '粉丝信息',
    options: [
      { label: '年龄段占比', value: 'fans_ages' },
      { label: '性别占比', value: 'fans_gender' },
      { label: '活跃占比', value: 'fans_active' }
    ]
  }
]

const DandelionQuote: FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [options, setoptions] = useState<Record<string, number>>({})
  const [uploadedFileInfo, setUploadedFileInfo] = useState<any>(null) // 添加状态保存上传文件信息

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setoptions((prev) => ({
      ...prev,
      [value]: checked ? 1 : 0
    }))
  }
  const handleUploadChange = (info: any) => {
    const { status, response } = info.file
    if (status === 'done') {
      // 上传成功，保存返回信息
      setUploadedFileInfo(response)
      window.message.success(`${info.file.name} 上传成功`)
    } else if (status === 'error') {
      window.message.error(`${info.file.name} 上传失败`)
    }
  }
  const handleSubmit = async () => {
    const email = form.getFieldValue('email')?.trim()
    const fileUrl = uploadedFileInfo?.data.fileUrl
    const kols = form.getFieldValue('kols')?.trim()

    if (!fileUrl && !kols) {
      window.message.error('请上传文件或填写达人主页链接')
      return
    }
    if (!email) {
      window.message.error('请输入邮箱')
      return
    }

    try {
      const params = {
        task_data: {
          action: 'xingtu_kol_detail',
          user_info: {
            user_id: 1,
            user_name: '若依',
            xid: '67816763000000000801fccd',
            oa_id: 1,
            oa_name: '若依',
            email: email // 已经trim过的email
          },
          task_info: {
            file_url: fileUrl,
            kols: kols ? kols.split('\n') : [],
            options
          }
        }
      }
      setLoading(true)

      const response = await fetch('https://rtoolapi.eshypdata.com/xingtu/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      window.message.success(data.message)

      // 重置表单和状态
      form.resetFields()
      setoptions({})
      setUploadedFileInfo(null)
    } catch (error) {
      window.message.error('提交失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolPageLayout title="蒲公英报价信息">
      <CardsContainer>
        {/* 第一块卡片 */}
        <Card>
          <Title level={5}>选择表头字段</Title>
          <Form form={form} layout="vertical">
            {headerSelectionData.map((categoryData, index) => (
              <CategorySection key={index}>
                <CategoryLabel>{categoryData.category}</CategoryLabel>
                <OptionsContainer>
                  {categoryData.options.map((option) => (
                    <CheckboxItem key={option.value}>
                      <Checkbox
                        checked={!!options[option.value]}
                        onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}>
                        {option.label}
                      </Checkbox>
                    </CheckboxItem>
                  ))}
                </OptionsContainer>
              </CategorySection>
            ))}
          </Form>
        </Card>

        {/* 第二块卡片 */}
        <Card>
          <Title level={5}>达人主页链接</Title>
          <Tabs
            items={[
              {
                key: '1',
                label: '方法一：输入达人主页链接',
                children: (
                  <Form form={form} layout="vertical">
                    <div style={{ marginBottom: 24 }}>
                      <Form.Item
                        label="请输入达人主页链接"
                        name="kols"
                        rules={[{ required: true, message: '请输入达人主页链接' }]}>
                        <TextArea
                          rows={6}
                          placeholder="请输入达人主页链接，支持多个人，一行一个链接，格式如下：https://www.xiaohongshu.com/user/profile/5f7b4fa7000000001e32f2f1"
                        />
                      </Form.Item>
                    </div>
                  </Form>
                )
              },
              {
                key: '2',
                label: '方法二：上传表格',
                children: (
                  <UploadContainer>
                    <UploadButtonContainer>
                      <Upload.Dragger
                        accept=".xlsx,.xls"
                        multiple={false}
                        action="https://oa.eshypdata.com/api/oss/file/upload"
                        onChange={handleUploadChange}>
                        <p className="ant-upload-drag-icon">
                          <CloudUploadOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                        <p className="ant-upload-hint">只能上传xlsx文件，表格内要有&quot;主页链接&quot;列</p>
                      </Upload.Dragger>
                    </UploadButtonContainer>
                  </UploadContainer>
                )
              }
            ]}
          />
        </Card>

        {/* 第三块卡片 */}
        <Card>
          <Title level={5}>输入接收结果的邮箱</Title>
          <Form form={form} layout="vertical">
            <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </Form>
        </Card>

        <Button type="primary" onClick={handleSubmit} loading={loading} block>
          提交
        </Button>
      </CardsContainer>
    </ToolPageLayout>
  )
}

// 使用styled-components创建样式化组件
const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  padding-bottom: 20px;
  gap: 10px;
`

const CategorySection = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
`

const CategoryLabel = styled(Text)`
  /* font-weight: bold; */
  margin-right: 16px;
`

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
`

const CheckboxItem = styled.div`
  margin-right: 8px;
  margin-bottom: 8px;
  min-width: 105px;
`

const UploadContainer = styled.div`
  text-align: center;
  padding: 20px 0;
`

const UploadButtonContainer = styled.div`
  margin: 30px 0;
`

export default DandelionQuote
