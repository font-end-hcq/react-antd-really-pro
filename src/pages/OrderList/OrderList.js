import React, {Component} from 'react'
import OrderSearch from '@modules/OrderSearch'
import OrderTable from '@modules/OrderTable'
class OrderList extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount() {

    }

    render() {

        return (
            <div>
                <p>订单列表</p>
                <OrderSearch />
                <OrderTable />
            </div>
        )
    }

}

export default OrderList
