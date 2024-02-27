export default {
  /**
   * 处理JSON字符串数据
   * @param {string} json json字符串
   * @returns {Object} 解析后的json数据
   */
  formatJsonStr(json) {
    if (json) {
      const jsonFn = (data) => {
        const newObj = Array.isArray(data) ? [] : {};

        // 返回数据为null时不做JSON转换的处理，处理为空字符串
        if (data) {
          for (let i in data) {
            const childData = data[i];

            if (typeof childData === 'object') {
              newObj[i] = jsonFn(childData);
              continue;
            } else if (typeof childData !== 'string') {
              newObj[i] = childData;
              continue;
            }

            try {
              const newValue = JSON.parse(childData);
              const isObj = typeof newValue === 'object';
              newObj[i] = isObj ? jsonFn(newValue) : childData;
            } catch {
              newObj[i] = childData;
            }
          }
          return newObj;
        } else {
          return '';
        }
      };
      return jsonFn(json);
    }
    return json;
  },

};
