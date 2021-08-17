/**
 * naive ui 按需引入配置文件
 */
import {
    create,
    NPopover,
    NInput,
    NTree,
    NButton
} from 'naive-ui';

const components = [
    NPopover,
    NInput,
    NTree,
    NButton
];

const naive = create({
	components
});

export default naive;