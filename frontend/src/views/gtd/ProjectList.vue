<template>
  <div class="project-page">
    <h2>项目清单</h2>
    <p class="subtitle">树状图展示，点击选中 → Tab添加子节点 / Enter添加同级 / 打字直接编辑</p>

    <!-- 项目列表 + 树状图 -->
    <div class="project-container">
      <!-- 左侧项目列表 -->
      <div class="project-sidebar">
        <div class="sidebar-header">
          <el-input
            v-model="newProjectTitle"
            placeholder="新建项目..."
            @keydown.enter="handleAddProject"
          >
            <template #append>
              <el-button :icon="Plus" @click="handleAddProject" />
            </template>
          </el-input>
        </div>
        <el-scrollbar class="project-scroll">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-item"
            :class="{ active: selectedProject?.id === project.id }"
            @click="selectProject(project)"
          >
            <el-icon><Folder /></el-icon>
            <span class="project-title">{{ project.title }}</span>
            <el-dropdown @command="handleCommand($event, project)" @click.stop>
              <el-button size="small" text @click.stop>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-empty v-if="!projects.length" description="暂无项目" :image-size="60" />
        </el-scrollbar>
      </div>

      <!-- 右侧树状图 -->
      <div class="tree-container">
        <div v-if="selectedProject" class="tree-wrapper">
          <!-- 操作提示 -->
          <div class="hint-bar">
            <span class="hint-keys">Tab: 子节点 | Enter: 同级 | 打字: 编辑 | Delete: 删除</span>
          </div>

          <!-- 树状图 -->
          <div class="tree-view">
            <TreeNode
              :node="rootNode"
              :selected-id="selectedNodeId"
              @select="onSelectNode"
              @add-child="onAddChild"
              @add-sibling="onAddSibling"
              @delete="onDeleteNode"
            />
          </div>
        </div>
        <el-empty v-else description="选择一个项目开始分解" :image-size="80" />
      </div>
    </div>

    <!-- 内联编辑框 -->
    <input
      v-if="isEditing"
      ref="editInputRef"
      v-model="editingText"
      class="inline-edit"
      :style="editBoxStyle"
      @keydown.enter="finishEditing"
      @keydown.tab.prevent="finishEditingAndAddChild"
      @keydown.escape="cancelEditing"
      @blur="finishEditing"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive, h } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { More, Plus, Folder } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CSSProperties } from 'vue'

const taskStore = useTaskStore()
const projects = computed(() => taskStore.tasksByStatus[TaskStatus.PROJECT] || [])

// 新建项目
const newProjectTitle = ref('')

const handleAddProject = async () => {
  if (!newProjectTitle.value.trim()) return
  await taskStore.createTask({
    title: newProjectTitle.value.trim(),
    status: TaskStatus.PROJECT,
    isProject: true
  })
  newProjectTitle.value = ''
  ElMessage.success('项目已创建')
}

// 选择的项目
const selectedProject = ref<Task | null>(null)
const selectedNodeId = ref<string | null>(null)
const allSubTasks = ref<Task[]>([])

// 树形数据
interface TreeNodeData {
  id: string
  label: string
  taskId?: number
  children: TreeNodeData[]
}
const rootNode = reactive<TreeNodeData>({
  id: '',
  label: '',
  children: []
})

// 编辑状态
const isEditing = ref(false)
const editingNodeId = ref<string | null>(null)
const editingText = ref('')
const editInputRef = ref<HTMLInputElement>()
const editBoxStyle = ref<CSSProperties>({})

const selectProject = async (project: Task) => {
  selectedProject.value = project
  selectedNodeId.value = null
  isEditing.value = false
  allSubTasks.value = await taskStore.fetchTasksByStatus(TaskStatus.PROJECT)
  buildTree(project)
}

// 构建树形数据
const buildTree = (project: Task) => {
  const subTasks = allSubTasks.value.filter(t => t.parentId === project.id)

  rootNode.id = `root-${project.id}`
  rootNode.label = project.title
  rootNode.taskId = project.id
  rootNode.children = []

  // 递归构建子树
  const buildChildren = (parentId: number | undefined): TreeNodeData[] => {
    if (!parentId) return []
    return subTasks
      .filter(t => t.parentId === parentId)
      .map(task => ({
        id: `task-${task.id}`,
        label: task.title,
        taskId: task.id,
        children: buildChildren(task.id)
      }))
  }

  rootNode.children = buildChildren(project.id)
}

// 选中节点
const onSelectNode = (nodeId: string, rect?: DOMRect) => {
  selectedNodeId.value = nodeId
  isEditing.value = false

  // 计算编辑框位置
  if (rect) {
    editBoxStyle.value = {
      left: `${rect.right + 10}px`,
      top: `${rect.top}px`
    }
  }
}

// 添加子节点
const onAddChild = async (nodeId: string) => {
  if (!selectedProject.value) return

  let parentId: number | undefined

  if (nodeId.startsWith('root-')) {
    parentId = selectedProject.value.id
  } else {
    const taskId = parseInt(nodeId.replace('task-', ''))
    if (!isNaN(taskId)) {
      parentId = taskId
    }
  }

  if (!parentId) return

  const newTask = await taskStore.createTask({
    title: '新步骤',
    status: TaskStatus.PROJECT,
    parentId
  })

  await refreshAndSelect(`task-${newTask.id}`)
}

// 添加同级节点
const onAddSibling = async (nodeId: string) => {
  if (!selectedProject.value) return

  let parentId: number | undefined

  if (nodeId.startsWith('root-')) {
    parentId = selectedProject.value.id
  } else {
    const taskId = parseInt(nodeId.replace('task-', ''))
    const task = allSubTasks.value.find(t => t.id === taskId)
    parentId = task?.parentId || selectedProject.value!.id
  }

  if (!parentId) return

  const newTask = await taskStore.createTask({
    title: '新步骤',
    status: TaskStatus.PROJECT,
    parentId
  })

  await refreshAndSelect(`task-${newTask.id}`)
}

// 删除节点
const onDeleteNode = async (nodeId: string) => {
  if (nodeId.startsWith('root-')) {
    ElMessage.warning('不能删除根节点')
    return
  }

  const taskId = parseInt(nodeId.replace('task-', ''))
  if (isNaN(taskId)) return

  await ElMessageBox.confirm('确定要删除这个步骤吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  await taskStore.deleteTask(taskId)
  selectedNodeId.value = null
  await refreshTree()
  ElMessage.success('已删除')
}

// 刷新并选中新节点
const refreshAndSelect = async (nodeId: string) => {
  allSubTasks.value = await taskStore.fetchTasksByStatus(TaskStatus.PROJECT)
  buildTree(selectedProject.value!)
  selectedNodeId.value = nodeId
  isEditing.value = true
  editingNodeId.value = nodeId
  editingText.value = ''

  await nextTick()
  editInputRef.value?.focus()
}

// 刷新树
const refreshTree = async () => {
  if (!selectedProject.value) return
  allSubTasks.value = await taskStore.fetchTasksByStatus(TaskStatus.PROJECT)
  buildTree(selectedProject.value)
}

// 完成编辑
const finishEditing = async () => {
  if (!editingText.value.trim()) {
    isEditing.value = false
    return
  }

  if (editingNodeId.value) {
    if (editingNodeId.value.startsWith('root-')) {
      // 根节点不能编辑
    } else {
      const taskId = parseInt(editingNodeId.value.replace('task-', ''))
      if (isNaN(taskId)) return
      const task = allSubTasks.value.find(t => t.id === taskId)
      if (task) {
        await taskStore.updateTask(taskId, { ...task, title: editingText.value.trim() })
      }
    }
  }

  isEditing.value = false
  editingNodeId.value = null
  await refreshTree()
}

// 完成编辑并添加子节点
const finishEditingAndAddChild = async () => {
  await finishEditing()
  if (selectedNodeId.value) {
    await onAddChild(selectedNodeId.value)
  }
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
  editingNodeId.value = null
  editingText.value = ''
}

// 处理菜单命令
const handleCommand = async (command: string, project: Task) => {
  if (command === 'delete') {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await taskStore.deleteTask(project.id!)
    if (selectedProject.value?.id === project.id) {
      selectedProject.value = null
    }
    ElMessage.success('已删除')
  }
}

// 键盘事件
const handleKeydown = async (e: KeyboardEvent) => {
  if (isEditing.value) return
  if (!selectedProject.value) return
  if ((e.target as HTMLElement).tagName === 'INPUT') return

  // Tab - 添加子节点
  if (e.key === 'Tab') {
    e.preventDefault()
    if (!selectedNodeId.value) {
      ElMessage.warning('请先选择一个节点')
      return
    }
    await onAddChild(selectedNodeId.value)
    return
  }

  // Enter - 添加同级节点
  if (e.key === 'Enter') {
    e.preventDefault()
    if (!selectedNodeId.value) {
      ElMessage.warning('请先选择一个节点')
      return
    }
    await onAddSibling(selectedNodeId.value)
    return
  }

  // Delete - 删除节点
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedNodeId.value && !selectedNodeId.value.startsWith('root-')) {
      e.preventDefault()
      await onDeleteNode(selectedNodeId.value)
    }
    return
  }

  // 直接打字 - 编辑
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (selectedNodeId.value && !selectedNodeId.value.startsWith('root-')) {
      editingText.value = e.key
      isEditing.value = true
      editingNodeId.value = selectedNodeId.value

      // 找到节点位置
      const nodeEl = document.querySelector(`[data-node-id="${selectedNodeId.value}"]`)
      if (nodeEl) {
        const rect = nodeEl.getBoundingClientRect()
        editBoxStyle.value = {
          left: `${rect.right + 10}px`,
          top: `${rect.top}px`
        }
      }

      await nextTick()
      editInputRef.value?.focus()
      editInputRef.value?.select()
    }
  }
}

onMounted(() => {
  taskStore.fetchAllTasks()
  window.addEventListener('keydown', handleKeydown)
})

// TreeNode 组件
const TreeNode = {
  props: {
    node: Object,
    selectedId: String,
    depth: { type: Number, default: 0 }
  },
  emits: ['select', 'add-child', 'add-sibling', 'delete'],
  setup(props: any, { emit }: any) {
    const handleClick = (e: Event) => {
      e.stopPropagation()
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      emit('select', props.node.id, rect)
    }

    const handleAddChild = (e: Event) => {
      e.stopPropagation()
      emit('add-child', props.node.id)
    }

    const handleAddSibling = (e: Event) => {
      e.stopPropagation()
      emit('add-sibling', props.node.id)
    }

    const handleDelete = (e: Event) => {
      e.stopPropagation()
      emit('delete', props.node.id)
    }

    return () => h('div', { class: 'tree-node-wrapper' }, [
      h('div', {
        class: ['tree-node', { selected: props.selectedId === props.node.id }],
        'data-node-id': props.node.id,
        onClick: handleClick
      }, [
        h('span', { class: 'node-label' }, props.node.label),
        h('div', { class: 'node-actions' }, [
          h('button', { class: 'action-btn', onClick: handleAddChild, title: '添加子节点' }, '+'),
          h('button', { class: 'action-btn', onClick: handleAddSibling, title: '添加同级' }, '↔'),
          !props.node.id.startsWith('root-')
            ? h('button', { class: 'action-btn delete', onClick: handleDelete, title: '删除' }, '×')
            : null
        ])
      ]),
      props.node.children?.length > 0
        ? h('div', { class: 'tree-children' },
            props.node.children.map((child: any) =>
              h(TreeNode, {
                key: child.id,
                node: child,
                selectedId: props.selectedId,
                onSelect: (id: string, rect: DOMRect) => emit('select', id, rect),
                onAddChild: (id: string) => emit('add-child', id),
                onAddSibling: (id: string) => emit('add-sibling', id),
                onDelete: (id: string) => emit('delete', id)
              })
            )
          )
        : null
    ])
  }
}
</script>

<style scoped>
.project-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.subtitle {
  color: #666;
  margin-bottom: 16px;
}

.project-container {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

.project-sidebar {
  width: 280px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.project-scroll {
  flex: 1;
  padding: 8px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.project-item:hover {
  background: #f5f5f5;
}

.project-item.active {
  background: #e6f7f7;
  color: #008080;
}

.project-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tree-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.hint-bar {
  padding: 10px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.hint-keys {
  color: #999;
  font-size: 12px;
}

.tree-view {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

/* 树状图样式 */
:deep(.tree-node-wrapper) {
  display: flex;
  flex-direction: column;
}

:deep(.tree-node) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #008080 0%, #006666 100%);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  margin: 4px 0;
  transition: all 0.2s;
  position: relative;
}

:deep(.tree-node:hover) {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,128,128,0.3);
}

:deep(.tree-node.selected) {
  outline: 3px solid #ff6b6b;
  outline-offset: 2px;
}

:deep(.tree-children) {
  margin-left: 40px;
  border-left: 2px dashed #008080;
  padding-left: 20px;
}

:deep(.tree-node:not(.selected)) {
  background: #fff;
  color: #333;
  border: 2px solid #008080;
}

:deep(.node-label) {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.node-actions) {
  display: none;
  gap: 4px;
}

:deep(.tree-node:hover .node-actions) {
  display: flex;
}

:deep(.action-btn) {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.action-btn:hover) {
  background: rgba(255,255,255,0.5);
}

:deep(.action-btn.delete:hover) {
  background: #ff6b6b;
}

/* 内联编辑框 */
.inline-edit {
  position: fixed;
  z-index: 100;
  width: 150px;
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid #008080;
  border-radius: 20px;
  outline: none;
  box-shadow: 0 2px 8px rgba(0,128,128,0.3);
}

@media (max-width: 768px) {
  .project-container {
    flex-direction: column;
  }

  .project-sidebar {
    width: 100%;
    max-height: 200px;
  }
}
</style>
