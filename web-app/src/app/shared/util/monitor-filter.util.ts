export function addFilterUtil(this: any, _this: any, e1: any): any {
    if (e1.name === 'otherFilters') {
      const newCheckedList = Object.assign([]);
      if(e1?.checked?.length > 0) {
        e1.checked.forEach((item: any) => {
          const itemChecked = _this.originFilterList.find((f: any) => f.field == item)
          if(itemChecked) newCheckedList.push(itemChecked)
        })
      }
      _this.defaultFilterList = [];
      newCheckedList.forEach((item: any) => _this.defaultFilterList.push(item))
    }
    _this.form.controls[e1.name].setValue(
        e1.input ? e1.input :
        e1.dateTimeRange ? (e1.dateTimeRange.to !== -1 ? {from: e1.dateTimeRange.from, to: e1.dateTimeRange.to} : {from: new Date().getTime() - e1.dateTimeRange.from, to: new Date().getTime()}) :
          e1.numberRange ? ({from: e1.numberRange.from, to: e1.numberRange.to}) :
            e1.timeRange ? ({from: e1.timeRange.from, to: e1.timeRange.to}) :
              e1.checked);
    for (let filter of _this.defaultFilterList) {
      if (e1.name === filter.field) {
        filter.selectedValue = e1.input ? e1.input : e1.dateTimeRange ? e1.dateTimeRange : e1.checked;
        break;
      }
    }
    _this.filterForm = _this.form.getRawValue();
    // onFilterFormChanged(_this.form.getRawValue(), _this)
}
export function removeFilterUtil(e: any, _this: any) {
    _this.form.controls[e].reset();
    for (let i = 0; i < _this.defaultFilterList.length; i++) {
      if (e === _this.defaultFilterList[i].field) {
        _this.defaultFilterList.splice(i, 1);
        break;
      }
    }
  }
