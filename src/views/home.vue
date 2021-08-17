<template>
	<go-tree
		:treeList="treeList"
		:rightFlag="rightFlag"
		:nodeKey="nodeKey"
		@handleNodeClick="handleNodeClick"
		@handleRightClick="handleRightClick"
		@handleClickTreeMenu="handleClickTreeMenu"
		@updateTreeMenu="updateTreeMenu"
		class="go-tree-flex"
	></go-tree>
</template>

<script lang="ts">
/**
 * @description
 * @create 2021-08-17
 * @author huangruiyang
 */
import { ref, defineComponent, onMounted } from 'vue';
import GoTree from '@/components/GoTree/index.vue';
import { createData } from '@/utils/tools';

export default defineComponent({
	name: 'Home',
	components: {
		GoTree
	},
	setup() {
		const treeList = createData();
		const rightFlag = ref(false); //是否显示右键菜单
		const defaultProps = {
			// 定义展示的属性，treeList中是subs和mName,
			children: 'subs',
			label: 'mName'
		};
		const nodeKey = 'mid'; // 树的唯一标志，mid,也是treeList的每一条数据的唯一标志

		function updateTreeMenu(val: boolean) {
			rightFlag.value = val;
		}
		function handleNodeClick(data: any) {
			console.log('树节点被点击：', data);
		}
		function handleRightClick(obj: any) {
			rightFlag.value = true; //显示右键菜单
			console.log('鼠标右键单击了该节点', obj);
		}
		function handleClickTreeMenu(name: any) {
			alert(name);
			rightFlag.value = false;
		}

		onMounted(() => {
			// 阻止浏览器默认右键菜单
			window.oncontextmenu = () => false;
		});
		return {
			treeList,
			rightFlag,
			defaultProps,
			nodeKey,
			updateTreeMenu,
			handleNodeClick,
			handleRightClick,
			handleClickTreeMenu
		};
	}
});
</script>

<style lang="scss" scoped></style>
