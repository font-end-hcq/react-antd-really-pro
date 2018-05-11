import React, {Component} from 'react'
import SearchInput from '@modules/ContractSearch'
import NewContract from '@modules/NewContract'
import ContractForm from '@modules/ContractForm'

class ContractManage extends Component {
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
                <p>合同管理</p>
                <SearchInput />
                <NewContract />
                <ContractForm />
            </div>
        )
    }

}

export default ContractManage
