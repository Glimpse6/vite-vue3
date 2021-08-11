<template>
	<!-- :style="{ position: 'absolute', left: `${clientX}px`, top: `${clientY}px` }" -->
	<div class="tree-container">
		<el-input
			placeholder="输入关键字进行过滤"
			v-model="filterText">
		</el-input>
		<!-- 点击node节点,才加载子节点的时候，需设置 :lazy="true" -->

		<el-tree
			class="_tree"
			:data="data"
			:props="defaultProps"
			@node-expand="handleNodeExpand"
			@node-click="handleNodeClick"
			@node-contextmenu="handleRightClick"
			:default-expanded-keys="expandedKeys"
			:filter-node-method="filterNode"
			:node-key="nodeKey"
			:highlight-current="true"
			ref="comnTree"
			:style="`max-height:${treeHeight}px;max-width:${treeWidth}px;overflow-x:auto;}`"
		>
			<template v-slot="{ node, data }">
				<span>
					<i :class="data.icon ? data.icon : 'el-icon-folder-opened'"></i>
					<span class="tree_label">{{ node.label }}</span>
					<span class="tree_label" v-if="data.total || data.total === 0" title="数量"
						>({{ data.total }})</span
					>
				</span>
			</template>
		</el-tree>
		<!-- 右键菜单 -->
		<n-popover
			id="contextMenu"
			placement="right"
			trigger="manual"
			:show="Flag"
			:x="clientX"
			:y="clientY"
			class="popover-intree"
			:style="{ width: '100px' }"
		>
			<ul>
				<li
					v-for="item in contextMenu"
					:key="item.id"
					class="context-menu"
					@click="handleClickMenu(item.name)"
				>
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
	emits: ['updateTreeMenu', 'handleNodeClick', 'handleRightClick', 'handleNodeExpand', 'handleClickTreeMenu'],
	setup: (props, { emit }) => {
		const comnTree = ref();
		let clientX = ref(0);
		let clientY = ref(0);
		const filterText = ref('');
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
		watch(filterText, (val) => {
			console.log(val);
			console.log(comnTree.value);
			comnTree.value?.filter?.(val);
		}, {
			immediate: true
		})

		function handleNodeClick (data: any) {
			emit('updateTreeMenu', false); // 点击树节点的时候，将右键菜单隐藏。
			emit('handleNodeClick', data);
		}

		function handleRightClick (
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

		function handleClickMenu (name: any) {
			emit('handleClickTreeMenu', name);
		}

		function handleNodeExpand (data: any, node: any, self: any) {
			emit('handleNodeExpand', data);
		}

		// 选中树节点的方法，修改的时候，id未变，子组件监听不到父组件传入的id变化时，可采取父组件主动获取子组件的该方法来实现修改后主动选择该树节点。
		function setCurrTreeNode (id: String) {
			comnTree.value?.setCurrentKey?.(id);
		}

		function filterNode (value: any, data: { [x: string]: string | any[]; }) {
			if (!value) return true;
			console.log(data);
			return data[props.defaultProps.label]?.indexOf(value) !== -1;
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
			data: createData(),
			defaultExpandedKeys: ref(['40', '41'])
		};
	}
});
</script>

<style lang="scss">
.tree-container {
	position: relative;

	._tree {
		color: #444;
		padding-left: 6px;
		overflow: auto;
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

	.el-popover {
		padding: 2px;
		min-width: 20px;
		border: 1px solid #ebeef5;
		border-radius: 0;
		box-shadow: 4px 4px 4px -4px rgb(121, 118, 118);
	}
	//重写tree的 active样式
	.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
		background: #648fdb;
		color: #fff;
	}
	//重写tree样式，才可使横向 超出显示滚动条
	.el-tree > .el-tree-node {
		min-width: 100%;
		display: inline-block;
	}
}
.popover-intree {
	// position: absolute;
	ul {
		padding: 3px;
	}
	li {
		list-style: none;
	}
}
.context-menu {
	letter-spacing: 1px;
	color: #222;
	cursor: pointer;
	height: 30px;
	line-height: 30px;
	color: #000;
	text-align: center;
	&:hover {
		border-radius: 2px;
		background: #648fdb;
		color: #fff;
	}
}
</style>
