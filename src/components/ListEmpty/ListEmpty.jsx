import React,{PureComponent} from 'react'


export default class ListEmpty extends PureComponent{
    render(){
        return <div className="ant-spin-nested-loading">
                <div className="ant-spin-container">
                    <div className="ant-table-wrapper">
                        <div className="ant-spin-nested-loading">
                            <div className="ant-spin-container">
                                <div className="ant-table ant-table-large ant-table-empty ant-table-scroll-position-left">
                                    <div className="ant-table-content">
                                        <div className="ant-table-body">
                                            <table className="">
                                                <colgroup></colgroup>
                                                <thead className="ant-table-thead"></thead>
                                                <tbody className="ant-table-tbody"></tbody>
                                            </table>
                                        </div>
                                    <div className="ant-table-placeholder">抱歉，暂无内容</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    }
}
