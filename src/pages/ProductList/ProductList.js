import React, {Component} from 'react'
import { Button } from 'antd';
import ProductSearch from '@modules/ProductSearch'
import ProductTable from '@modules/ProductTable'

class ProductList extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount() {
        
    }
    _handleCreate = () => {
        window.location.href = `#/mall/create/new`
    }
    render() {
        return (
            <div>
                <p>商品列表</p>
                <ProductSearch />
                <Button type='primary' className='newButton' onClick={this._handleCreate}>+ 新建</Button>
                <ProductTable />
            </div>
        )
    }

}

export default ProductList
