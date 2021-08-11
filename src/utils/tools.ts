/**
 * 获取当前视口高度
 * @returns 当前视口高度
 */
export function getViewHeight() {
	let winHeight = 0;
	if (window.innerHeight) {
		winHeight = window.innerHeight;
	} else if (document.body && document.body.clientHeight) {
		winHeight = document.body.clientHeight;
	}
	if (document.documentElement && document.documentElement.clientHeight) {
		winHeight = document.documentElement.clientHeight;
	}
	return winHeight;
}

export function createData (level = 4, baseKey = ''): {} {
	if (!level) return {};
	return Array.apply(null, { length: 6 - level }).map((_, index) => {
		const key = '' + baseKey + level + index;
		return {
			mName: createLabel(level),
			key,
			subs: createData(level - 1, key)
		};
	});
}

export function createLabel (level: number) {
	if (level === 4) return '道生一';
	if (level === 3) return '一生二';
	if (level === 2) return '二生三';
	if (level === 1) return '三生万物';
}
