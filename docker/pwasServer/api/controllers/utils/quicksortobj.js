module.exports = (function() {

    function partition(array, field, primer, left, right) {

        var cmp, minEnd = left,
            maxEnd
        if (primer) {
            cmp = primer(array[right - 1][field])
            for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
                if (primer(array[maxEnd][field]) <= cmp) {
                    swap(array, maxEnd, minEnd);
                    minEnd += 1;
                }
            }
        } else {
            cmp = array[right - 1][field]
            for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
                if (array[maxEnd][field] <= cmp) {
                    swap(array, maxEnd, minEnd);
                    minEnd += 1;
                }
            }
        }
        swap(array, minEnd, right - 1);
        return minEnd;
    }

    function swap(array, i, j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        return array;
    }

    function quickSort(array, field, primer, left, right) {
        if (left < right) {
            var p = partition(array, field, primer, left, right);
            quickSort(array, field, primer, left, p);
            quickSort(array, field, primer, p + 1, right);
        }
        return array;
    }

    return function(array, field, primer) {
        return quickSort(array, field, primer, 0, array.length);
    };
}());