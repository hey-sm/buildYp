import React, { useState } from 'react';
import { Input, message, Card, Tooltip, Space } from 'antd';
import * as Icons from '@ant-design/icons';
import styled from 'styled-components';
import { CopyOutlined } from '@ant-design/icons';

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  padding: 16px;
`;

const IconCard = styled(Card)`
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .icon-wrapper {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .icon-name {
    font-size: 12px;
    color: #666;
    word-break: break-all;
  }
`;

const IconManager: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  // 获取所有图标
  const allIcons = Object.entries(Icons).filter(([name]) => 
    name.endsWith('Outlined') || name.endsWith('Filled') || name.endsWith('TwoTone')
  );

  // 过滤图标
  const filteredIcons = allIcons.filter(([name]) =>
    name.toLowerCase().includes(searchText.toLowerCase())
  );

  // 复制图标名称
  const copyIconName = (name: string) => {
    navigator.clipboard.writeText(name);
    messageApi.success(`已复制图标名称: ${name}`);
  };

  return (
    <div>
      {contextHolder}
      <div style={{ padding: '16px 16px 0' }}>
        <Input.Search
          placeholder="搜索图标..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
      <IconGrid>
        {filteredIcons.map(([name, Icon]) => (
          <Tooltip key={name} title={`点击复制: ${name}`}>
            <IconCard
              size="small"
              onClick={() => copyIconName(name)}
              hoverable
            >
              <div className="icon-wrapper">
                {React.createElement(Icon as any)}
              </div>
              <div className="icon-name">
                <Space>
                  {name}
                  <CopyOutlined style={{ fontSize: '12px' }} />
                </Space>
              </div>
            </IconCard>
          </Tooltip>
        ))}
      </IconGrid>
    </div>
  );
};

export default IconManager; 