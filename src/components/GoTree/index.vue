<template>
	<div>
		<n-input v-model:value="filterText" placeholder="搜索" />

		<n-tree
			ref="comnTree"
			:data="data"
			block-node
			@update:expanded-keys="handleNodeExpand"
			@update:selected-keys="handleNodeClick"
			@node-contextmenu="handleRightClick"
			draggable
			:default-expanded-keys="expandedKeys"
			:render-label="renderLabel"
			:pattern="filterText"
			:filter="filterNode"
			:key="nodeKey"
		>
		</n-tree>

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
import { h, ref, computed, defineComponent, onMounted, watch } from 'vue';
import { getViewHeight } from '@/utils/tools';

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
	setup: (props, { emit }: any) => {
		const comnTree = ref();
		const data = ref(props.treeList);
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
		// watch(filterText, (val) => {
		// 	console.log(val);
		// 	console.log(comnTree.value);
		// 	comnTree.value?.filter?.(val);
		// }, {
		// 	immediate: true
		// })

		function handleNodeClick (data: any) {
			emit('updateTreeMenu', false); // 点击树节点的时候，将右键菜单隐藏。
			emit('handleNodeClick', data);
		}

		function handleRightClick (
			event: { offsetX: number; clientY: number },
			obj: { [x: string]: String },
			node?: any,
			self?: any
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
			console.log(comnTree.value);
			comnTree.value?.setCurrentKey?.(id);
		}

		// function filterNode (value: any, data: { [x: string]: string | any[]; }) {
		// 	if (!value) return true;
		// 	console.log(data);
		// 	return data[props.defaultProps.label]?.indexOf(value) !== -1;
		// }
		
		function filterNode (value: String, data: { value: { [x: string]: String[]; }; }) {
			if (!value) return true;
			console.log(data);
			return data.value?.[props.defaultProps.label]?.indexOf(value) !== -1;
		}

		function renderLabel ({ option, checked, selected }) {
			console.log({ option, checked, selected });
			return h(
				'n-button',
				{
					text: true, type: 'primary',
					onmouseup: (event: any) => {
						event?.button === 2 && handleRightClick(event, option);
					}
				},
				{ default: () => option.label }
			)
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
			data,
			defaultExpandedKeys: ref(['40', '41']),
			renderLabel
		};
	}
});
</script>

<style lang="scss">
</style>

