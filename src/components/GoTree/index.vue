<template>
	<div class="tree-container" :style="`width: ${treeWidth}px; height: ${treeHeight}px`">
		<el-input placeholder="输入想找的页面" v-model="filterText" size="mini">
			<template #suffix>
				<n-button text color="#F2C249" @click="seachData">
					<n-icon size="20">
						<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
							<path d="M221.09 64a157.09 157.09 0 1 0 157.09 157.09A157.1 157.1 0 0 0 221.09 64z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"></path>
							<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M338.29 338.29L448 448"></path>
						</svg>
					</n-icon>
				</n-button>
			</template>
		</el-input>
		<!-- 点击node节点,才加载子节点的时候，需设置 :lazy="true" -->

		<el-scrollbar always :height="`${treeHeight}px`">
			<el-tree
				class="_tree"
				:data="treeData"
				:props="defaultProps"
				@node-expand="handleNodeExpand"
				@node-click="handleNodeClick"
				@node-contextmenu="handleRightClick"
				:default-expanded-keys="expandedKeys"
				:filter-node-method="filterNode"
				:node-key="nodeKey"	
				:highlight-current="true"
				ref="comnTree"
			>
				<template v-slot="{ node, data }">
					<div v-show="data.active" class="title"></div>
					<span>
						<i :class="data.icon ? data.icon : 'el-icon-folder-opened'"></i>
						<span class="tree_label">{{ node.label }}</span>
						<span class="tree_label" v-if="data.total || data.total === 0" title="数量"
							>({{ data.total }})</span
						>
					</span>
				</template>
			</el-tree>
		</el-scrollbar>

		<!-- 右键菜单 -->
		<n-popover
			id="contextMenu"
			placement="bottom"
			trigger="manual"
			:show="Flag"
			:x="clientX"
			:y="clientY"
			class="popover-intree"
			:style="{ width: '50px' }"
		>
			<ul>
				<li
					v-for="item in contextMenu"
					:key="item.id"
					class="context-menu"
					@click="handleClickMenu(item.name)"
				>
					<n-icon>
						<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
							<path d="M221.09 64a157.09 157.09 0 1 0 157.09 157.09A157.1 157.1 0 0 0 221.09 64z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"></path>
							<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M338.29 338.29L448 448"></path>
						</svg>
					</n-icon>
					{{ item.name }}
				</li>
			</ul>
		</n-popover>
	</div>
</template>

<script lang="ts">
import { ref, computed, defineComponent, onMounted, watch } from 'vue';
import { getViewHeight, createData } from '@/utils/tools';

export default defineComponent({
	name: 'GoTree',
	props: {
		treeList: {
			type: Array
		},
		defaultProps: {
			type: Object,
			default: () => {
				return {
					children: 'children',
					label: 'name'
					// isleaf: 'leaf'   // 需要添加叶子节点的页面
				};
			}
		},
		// 每个树节点作为唯一的标识属性
		nodeKey: {
			type: String,
			default: {
				return: 'id'
			}
		},
		contextMenu: {
			type: Array,
			default: () => {
				let menu = [
					{
						name: '添加',
						value: 'add'
					},
					{
						name: '修改',
						value: 'edit'
					},
					{
						name: '删除',
						value: 'del'
					}
				]; //树的右键菜单
				return menu;
			}
		},
		rightFlag: {
			type: Boolean,
			default: () => {
				return false;
			}
		},
		treeHeight: {
			type: Number,
			default: () => {
				return getViewHeight() - 200;
			}
		},
		treeWidth: {
			type: Number,
			default: () => {
				return 237;
			}
		},
		expandedKeys: {
			// 默认展开的树节点，ids
			type: Array,
			default: () => {
				return [];
			}
		}
	},
	emits: [
		'updateTreeMenu',
		'handleNodeClick',
		'handleRightClick',
		'handleNodeExpand',
		'handleClickTreeMenu'
	],
	setup: (props, { emit }) => {
		const comnTree = ref();
		let clientX = ref(0);
		let clientY = ref(0);
		const filterText = ref('');
		const treeData = ref(createData());
		const Flag = computed({
			get() {
				return props.rightFlag;
			},
			set(val) {
				emit('updateTreeMenu', val);
			}
		});
		const nodeKey = computed(() => props.nodeKey);
		onMounted(() => {
			// 监听，除了点击自己，点击其他地方将自身隐藏
			document.addEventListener('click', e => {
				const contextMenu = document.getElementById('contextMenu');
				if (contextMenu) {
					if (!contextMenu.contains(e.target)) {
						emit('updateTreeMenu', false);
					}
				}
			});
		});
		// watch(
		// 	filterText,
		// 	val => {
		// 		console.log(val);
		// 		console.log(comnTree.value);
		// 		comnTree.value?.filter?.(val);
		// 	},
		// 	{
		// 		immediate: true
		// 	}
		// );

		function handleNodeClick(data: any) {
			emit('updateTreeMenu', false); // 点击树节点的时候，将右键菜单隐藏。
			emit('handleNodeClick', data);
			filterStatus(treeData.value);
			data.active = true;
			console.log(data.active);
		}

		function handleRightClick(
			event: { offsetX: number; clientY: number },
			obj: { [x: string]: String },
			node: any,
			self: any
		) {
			//  确定 右键菜单出现的位置
			clientX.value = event.offsetX + 150;
			clientY.value = event.clientY; // 该高度需据自己的布局调整
			console.log(clientX.value, clientY.value);
			setCurrTreeNode(obj[nodeKey.value]);
			emit('handleRightClick', obj);
		}

		function handleClickMenu(name: any) {
			emit('handleClickTreeMenu', name);
		}

		function handleNodeExpand(data: any, node: any, self: any) {
			emit('handleNodeExpand', data);
		}

		// 选中树节点的方法，修改的时候，id未变，子组件监听不到父组件传入的id变化时，可采取父组件主动获取子组件的该方法来实现修改后主动选择该树节点。
		function setCurrTreeNode(id: String) {
			comnTree.value?.setCurrentKey?.(id);
		}

		function filterNode(value: any, data: { [x: string]: string | any[] }) {
			if (!value) return true;
			console.log(data);
			return data[props.defaultProps.label]?.indexOf(value) !== -1;
		}
		function filterStatus (arr: any[]) {
			arr.forEach(o => {
				o.active = false;
				o[props.defaultProps.children] && filterStatus(o[props.defaultProps.children]);
			});
		}
		function seachData () {
			comnTree.value?.filter?.(filterText.value);
		}

		return {
			comnTree,
			clientX,
			clientY,
			Flag,
			nodeKey,
			filterText,
			handleNodeClick,
			handleRightClick,
			handleClickMenu,
			handleNodeExpand,
			setCurrTreeNode,
			filterNode,
			treeData,
			defaultExpandedKeys: ref(['40', '41']),
			seachData
		};
	}
});
</script>

<style lang="scss">
.tree-container {
	._tree {
		margin: 5px;
		color: #444;
		padding-left: 6px;
		overflow: hidden !important;
		//更改tree的默认图标颜色，图标是否为叶子节点都会出现
		// span {
		//   color: $icon_color;
		// }
		// .is-leaf {
		//   color: transparent;
		// }
		.tree_label {
			font-size: 14px;
			letter-spacing: 1px;
			margin-left: 5px;
		}
	}

	// 重写tree的 active样式
	.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
		border-radius: 4px;
		background: #F1F4F6;
	}
	// 重写tree样式，才可使横向 超出显示滚动条
	.el-tree > .el-tree-node {
		// min-width: 100%;
		// display: inline-block;
	}
	// 重写 el-input 样式
	.el-input__inner {
		border-radius: inherit;
		border-width: 0 0 1px 0;
	}
	.el-input__suffix {
		top: 5px;
	}
	/* 小三角图标右移 */
	.el-tree-node__expand-icon {
		position: absolute;
		right: 2%;
		font-size: 18px;
	}

	/* 三角图标 收缩 */
	.el-tree-node__content > .el-tree-node__expand-icon {
		margin-top: 5px;
		-webkit-transform: rotate(90deg);
		transform: rotate(90deg);
	}

	/* 三角图标 展开 */
	.el-tree-node__content > .el-tree-node__expand-icon.expanded {
		-webkit-transform: rotate(-90deg);
		transform: rotate(-90deg);
	}
	.title {
		position: relative;
		left: -10px;
	}

	.title:before {
		content: '';
		background-color: #FFBD68;
		width: 4px;
		height: 23px;
		position: absolute;
		left: 0;
		top: 50%;
		margin-top: -12px;
		-webkit-border-radius: 3px;
		-moz-border-radius: 3px;
		border-radius: 3px;
	}
}
// .popover-intree {
// 	// position: absolute;
// 	ul {
// 		// padding: 3px;
// 	}
// 	li {
// 		list-style: none;
// 	}
// }
.context-menu {
	font-size: 12px;
	letter-spacing: 1px;
	color: #222;
	cursor: pointer;
	height: 20px;
	line-height: 20px;
	color: #000;
	text-align: center;
	border-bottom: 1px #dcdfe6 solid;
	&:hover {
		border-radius: 2px;
		background: #648fdb;
		color: #fff;
	}
}
</style>
