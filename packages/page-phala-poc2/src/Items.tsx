import { I18nProps } from '@polkadot/react-components/types';

import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import { Button, Card, Grid, Label, Icon, Input, Rating } from 'semantic-ui-react';

import { Item } from './legacy/models';
import { pubkeyToCompany } from './legacy/utils';
import { usePhalaShared } from './context';
import ViewItem from './ViewItem';
import { Modal } from '@polkadot/react-components';

interface Props extends I18nProps  {
  accountId: string | null;
  basePath: string
}

interface DatasetProps {
  basePath: string,
  className: string,
  item: Item;
}

function _Dataset ({ className = '', item, id }: DatasetProps): React.ReactElement | null {
  const history = useHistory();
  const { basePath } = usePhalaShared(); 
  const [modal, setModal] = useState(false);

  function handleClick() {
    setModal(true)
  }
  return <>
    <Card onClick={handleClick} className={className} raised={false} as='div'>
      <Card.Content>
      <Card.Header>{item.details.name}</Card.Header>
      </Card.Content>
      <Card.Content>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <Rating maxRating={5} defaultRating={4} icon='star' />
            </Grid.Column>
            <Grid.Column width={6}>
              已消费123次
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <br/>
        <p>商户: {pubkeyToCompany[item.seller]}</p>
        <p>链上地址: {item.details.datasetLink}</p>
        <p>数据总数: 300万条</p>
        <p>数据大小: 2TB</p>
        <Label as='a' color='red' size="tiny">仅限TEE</Label> <Label color='green' size="tiny">已上链</Label>
        <p>数据描述: </p>
        <p style={{color: '#777', fontSize: 12}}>
          {item.details.description}
        </p>
        <p>价格:</p>
        <p style={{color: '#777', fontSize: 12}}>
          计价方式: 按量付费 <br/>
          价格: {parseFloat(item.details.price.PerRow.price)/1e14}元/条
        </p>
      </Card.Content>
      {modal && <Modal onClose={() => setModal(false)}>
        <Modal.Content>
          <ViewItem item={item} id={id} />
        </Modal.Content>
      </Modal>}
    </Card>
  </>
}

const Dataset = styled(_Dataset)`
  p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

function Items ({ className, t }: Props): React.ReactElement<Props> | null {
  const history = useHistory();
  const { basePath, pApi, accountId } = usePhalaShared(); 
  const [dataItems, setDataItems] = useState<Array<Item>>([]);

  useEffect(() => {
    if (!accountId) {
      history.push(`${basePath}/settings`);
    }
  }, [accountId]);

  useEffect(() => {
    if (!pApi) { return }
    pApi.getItems()
      .then(res => {
        setDataItems(res?.GetItems?.items || []);
      });
  }, [pApi])

  function handleListDataset() {
    history.push(`${basePath}/list`);
  }

  return (
    <div className={className}>
      <h1>数据商品市场</h1>
      {/* <div>全部 / 我的</div> */}
      <hr />

      <Grid>
        {/* <Grid.Row columns={3}>
          <Grid.Column>
            数据标题 <Input placeholder='' />
          </Grid.Column>
          <Grid.Column>
            买家名称 <Input placeholder='' />
          </Grid.Column>
          <Grid.Column>
            数据类型 <Input placeholder='' />
          </Grid.Column>
        </Grid.Row> */}
        <Grid.Row columns={2}>
          <Grid.Column floated='left'>
            <Button primary onClick={handleListDataset}><Icon name='add' />新建商品</Button>
          </Grid.Column>
          {/* <Grid.Column floated='right' textAlign='right'>
            <Button primary>查询</Button>
            <Button secondary>重置</Button>
          </Grid.Column> */}
        </Grid.Row>
      </Grid>

      <Grid doubling stackable>{
        dataItems.map((i, idx) => (
          <Grid.Column key={idx} width={5}>
            <Dataset item={i} id={idx} />
          </Grid.Column>
        ))
      }</Grid>
    </div>
  )
}

export default Items;