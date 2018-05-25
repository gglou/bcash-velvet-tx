
var helpers = {
	tailingZeros (hexString) {
		var zeros = 0;
		for (var i = 0; i < hexString.length; i++) {
			var ch = hexString.charAt(i);
			if (hexString.charAt(i) == '0') {
				zeros += 4;
			} else {
				var num = parseInt(ch, 16);
				if (num > 7) return zeros;
				if (num > 3) return zeros + 1;
				return zeros + (num == 1 ? 3 : 2);
			}
		}
		return zeros;
	}
}

module.exports = helpers;