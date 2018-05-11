export default function(JSONData, FileName, ShowLabel){

    // 用法
    // dt:[{
    //     amount:111,
    //     create_time:"2017-08-08 15:16:52",
    //     goods_name:"223期《8月攻坚战——做好暑期续班及秋季招生》11111111111111111111",
    //     nicheng:'111',
    //     phone:"13738375762",
    //     status:"已完成",
    //     type:"手动添加",
    // }]
    // JSON2EXCEL(dt,'文件名称',['昵称','手机号','订单类型','商品名称','订单金额(元)','订单状态','下单时间'])
    // 第三个参数的顺序必须与dt对象的属性顺序相同

    //先转化json
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

        var excel = '<table>';

        //设置表头
        var row = "<tr>";
        for (var i = 0, l = ShowLabel.length; i < l; i++) {
            row += "<td>" + ShowLabel[i] + '</td>';
        }


        //换行
        excel += row + "</tr>";

        //设置数据
        for (var i = 0; i < arrData.length; i++) {
            var row = "<tr>";

            for (var index in arrData[i]) {
                var value = arrData[i][index] || ''
                row += '<td>' + value + '</td>';
            }

            excel += row + "</tr>";
        }

        excel += "</table>";
        // excel = '<table><tr><td>111</td><td>2222</td></tr><tr><td>111</td><td>2222</td></tr></table>'

        var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
        excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
        excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel';
        excelFile += '; charset=UTF-8">';
        excelFile += "<head>";
        excelFile += "<!--[if gte mso 9]>";
        excelFile += "<xml>";
        excelFile += "<x:ExcelWorkbook>";
        excelFile += "<x:ExcelWorksheets>";
        excelFile += "<x:ExcelWorksheet>";
        excelFile += "<x:Name>";
        excelFile += "表一";
        excelFile += "</x:Name>";
        excelFile += "<x:WorksheetOptions>";
        excelFile += "<x:DisplayGridlines/>";
        excelFile += "</x:WorksheetOptions>";
        excelFile += "</x:ExcelWorksheet>";
        excelFile += "</x:ExcelWorksheets>";
        excelFile += "</x:ExcelWorkbook>";
        excelFile += "</xml>";
        excelFile += "<![endif]-->";
        excelFile += "</head>";
        excelFile += "<body>";
        excelFile += excel;
        excelFile += "</body>";
        excelFile += "</html>";


        var uri = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(excelFile);

        var link = document.createElement("a");
        link.href = uri;

        link.style = "visibility:hidden";
        link.download = FileName + ".xls";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
}
