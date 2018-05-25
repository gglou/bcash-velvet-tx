
var helpers = {
	// Big-endian
	trailingZeros (hexString) {
		var zeros = 0;
		for (var i = hexString.length - 1; i >= 0; i--) {
			var ch = hexString.charAt(i);
			if (hexString.charAt(i) == '0') {
				zeros += 4;
			} else {
				var num = parseInt(ch, 16);
				if ((num & 1) == 0) return zeros + 1;
				if ((num & 3) == 0) return zeros + 2;
				if ((num & 7) == 0) return zeros + 3;
				return zeros;
			}
		}
		return zeros;
	}
}

module.exports = helpers;