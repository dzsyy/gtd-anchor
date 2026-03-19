<template>
  <div class="project-page">
    <h2>项目清单</h2>
    <p class="subtitle">选中节点 → Tab添加子节点 / Enter添加同级节点 / 直接打字编辑</p>

    <!-- 项目列表 + 思维导图 -->
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

      <!-- 右侧思维导图 -->
      <div class="mindmap-container">
        <div v-if="selectedProject" class="mindmap-wrapper">
          <!-- 操作提示 -->
          <div class="hint-bar">
            <span v-if="isEditing">正在编辑... 输入完成按 Enter</span>
            <span v-else-if="selectedNode">已选中: {{ selectedNode.data?.label || '根节点' }}</span>
            <span v-else>点击选择一个节点</span>
            <span class="hint-keys">Tab: 子节点 | Enter: 同级 | 打字: 编辑</span>
          </div>

          <VueFlow
            ref="vueFlowRef"
            :nodes="nodes"
            :edges="edges"
            :default-viewport="{ x: 0, y: 300, zoom: 0.8 }"
            :min-zoom="0.2"
            :max-zoom="2"
            fit-view-on-init
            class="mindmap-flow"
            @node-click="onNodeClick"
            @pane-click="onPaneClick"
          >
            <Background pattern-color="#aaa" :gap="20" />
            <Controls />
          </VueFlow>
        </div>
        <el-empty v-else description="选择一个项目开始分解" :image-size="80" />
      </div>
    </div>

    <!-- 内联编辑输入框 -->
    <div
      v-if="isEditing"
      class="inline-edit"
      :style="editBoxStyle"
    >
      <input
        ref="editInputRef"
        v-model="editingText"
        class="edit-input"
        @keydown.enter="finishEditing"
        @keydown.tab.prevent="finishEditingAndAddChild"
        @keydown.escape="cancelEditing"
        @blur="finishEditing"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { CSSProperties } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { More, Plus, Folder } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { Node, Edge } from '@vue-flow/core'

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
const selectedNode = ref<Node | null>(null)
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const allSubTasks = ref<Task[]>([])

// 编辑状态
const isEditing = ref(false)
const editingNodeId = ref<string | null>(null)
const editingText = ref('')
const editInputRef = ref<HTMLInputElement>()
const editBoxStyle = ref<CSSProperties>({})

const selectProject = async (project: Task) => {
  selectedProject.value = project
  selectedNode.value = null
  isEditing.value = false
  allSubTasks.value = await taskStore.fetchTasksByStatus(TaskStatus.PROJECT)
  const subTasks = allSubTasks.value.filter(t => t.parentId === project.id)
  buildMindMap(project, subTasks)
}

// 构建思维导图 - 左对齐
const buildMindMap = (project: Task, subTasks: Task[]) => {
  const newNodes: Node[] = []
  const newEdges: Edge[] = []

  // 根节点
  const rootNode: Node = {
    id: `root-${project.id}`,
    position: { x: 600, y: 300 },
    data: { label: project.title, isRoot: true },
    style: {
      background: 'linear-gradient(135deg, #008080 0%, #006666 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      padding: '18px 30px',
      fontSize: '16px',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(0,128,128,0.3)'
    }
  }
  newNodes.push(rootNode)

  // 子节点 - 垂直排列
  const levelX = 100
  const startY = 100
  const gapY = 120

  subTasks.forEach((task, index) => {
    const nodeId = `task-${task.id}`
    const y = startY + index * gapY

    const node: Node = {
      id: nodeId,
      position: { x: levelX, y },
      data: { label: task.title, taskId: task.id, parentId: task.parentId },
      style: {
        background: '#fff',
        border: '2px solid #008080',
        borderRadius: '20px',
        padding: '12px 24px',
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }
    newNodes.push(node)

    newEdges.push({
      id: `edge-${project.id}-${task.id}`,
      source: `root-${project.id}`,
      target: nodeId,
      type: 'smoothstep',
      style: { stroke: '#008080', strokeWidth: 2 }
    })
  })

  nodes.value = newNodes
  edges.value = newEdges
}

// 点击画布 - 取消选择
const onPaneClick = () => {
  selectedNode.value = null
  isEditing.value = false
}

// 点击节点 - 选中
const onNodeClick = (event: any) => {
  const node = event.node
  selectedNode.value = node
}

// 开始编辑
const startEditing = async (node: Node | null, mode: 'new' | 'edit' = 'edit') => {
  if (!selectedProject.value) return

  // 如果是编辑模式且有选中节点
  if (mode === 'edit' && node) {
    editingNodeId.value = node.id
    editingText.value = node.data.label || ''
  } else {
    editingNodeId.value = null
    editingText.value = ''
  }

  isEditing.value = true

  await nextTick()

  // 计算输入框位置（基于节点位置）
  if (node && node.position) {
    editBoxStyle.value = {
      left: `${node.position.x + 50}px`,
      top: `${node.position.y + 20}px`
    }
  } else {
    // 新节点在选中节点旁边
    if (selectedNode.value?.position) {
      editBoxStyle.value = {
        left: `${selectedNode.value.position.x + 200}px`,
        top: `${selectedNode.value.position.y + 20}px`
      }
    }
  }

  editInputRef.value?.focus()
}

// 完成编辑 - 保存
const finishEditing = async () => {
  if (!editingText.value.trim()) {
    isEditing.value = false
    return
  }

  if (editingNodeId.value) {
    // 编辑现有节点
    const taskId = nodes.value.find(n => n.id === editingNodeId.value)?.data.taskId
    if (taskId) {
      const task = allSubTasks.value.find(t => t.id === taskId)
      if (task) {
        await taskStore.updateTask(taskId, { ...task, title: editingText.value.trim() })
      }
    }
  } else {
    // 新建节点 - 作为根节点的子节点
    await taskStore.createTask({
      title: editingText.value.trim(),
      status: TaskStatus.PROJECT,
      parentId: selectedProject.value!.id
    })
  }

  isEditing.value = false
  editingNodeId.value = null

  // 刷新
  await refreshMindMap()
}

// 完成编辑并添加子节点
const finishEditingAndAddChild = async () => {
  // 先保存当前编辑
  if (editingText.value.trim()) {
    await finishEditing()

    // 然后添加子节点
    if (selectedNode.value && !selectedNode.value.id.startsWith('root-')) {
      const parentTaskId = selectedNode.value.data.taskId
      if (parentTaskId) {
        // 创建子任务
        const newTask = await taskStore.createTask({
          title: '新步骤',
          status: TaskStatus.PROJECT,
          parentId: parentTaskId
        })

        // 刷新并选中新节点
        await refreshMindMap()

        // 找到新节点并开始编辑
        const newNode = nodes.value.find(n => n.data.taskId === newTask.id)
        if (newNode) {
          selectedNode.value = newNode
          await nextTick()
          await startEditing(newNode, 'new')
        }
      }
    }
  }
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
  editingNodeId.value = null
  editingText.value = ''
}

// 删除节点
const deleteNode = async () => {
  if (!selectedNode.value) return

  // 不能删除根节点
  if (selectedNode.value.id.startsWith('root-')) {
    ElMessage.warning('不能删除根节点')
    return
  }

  const taskId = selectedNode.value.data.taskId
  if (!taskId) return

  await ElMessageBox.confirm('确定要删除这个步骤吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  await taskStore.deleteTask(taskId)
  selectedNode.value = null

  await refreshMindMap()
  ElMessage.success('已删除')
}

// 刷新思维导图
const refreshMindMap = async () => {
  if (!selectedProject.value) return
  allSubTasks.value = await taskStore.fetchTasksByStatus(TaskStatus.PROJECT)
  const subTasks = allSubTasks.value.filter(t => t.parentId === selectedProject.value?.id)
  buildMindMap(selectedProject.value, subTasks)
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

// 键盘事件处理
const handleKeydown = async (e: KeyboardEvent) => {
  // 如果正在编辑，不处理
  if (isEditing.value) return

  // 如果没有选中项目，不处理
  if (!selectedProject.value) return

  // 如果焦点在输入框，不处理
  if ((e.target as HTMLElement).tagName === 'INPUT') return

  // Tab - 添加子节点
  if (e.key === 'Tab') {
    e.preventDefault()

    if (!selectedNode.value) {
      ElMessage.warning('请先选择一个节点')
      return
    }

    // 如果选中根节点，添加为根节点的子节点
    let parentTaskId: number | undefined
    if (selectedNode.value.id.startsWith('root-')) {
      parentTaskId = selectedProject.value!.id
    } else {
      parentTaskId = selectedNode.value.data.taskId
    }

    if (!parentTaskId) {
      ElMessage.warning('无法添加子节点')
      return
    }

    // 创建新的子节点
    const newTask = await taskStore.createTask({
      title: '新步骤',
      status: TaskStatus.PROJECT,
      parentId: parentTaskId
    })

    await refreshMindMap()

    // 选中新节点并编辑
    const newNode = nodes.value.find(n => n.data.taskId === newTask.id)
    if (newNode) {
      selectedNode.value = newNode
      await nextTick()
      await startEditing(newNode, 'new')
    }
    return
  }

  // Enter - 添加同级节点
  if (e.key === 'Enter') {
    e.preventDefault()

    if (!selectedNode.value) {
      ElMessage.warning('请先选择一个节点')
      return
    }

    // 如果选中根节点，添加到根节点下
    let parentId = selectedProject.value!.id

    if (!selectedNode.value.id.startsWith('root-')) {
      // 获取选中节点的父节点ID
      const currentTaskId = selectedNode.value.data.taskId
      const currentTask = allSubTasks.value.find(t => t.id === currentTaskId)
      if (currentTask?.parentId) {
        parentId = currentTask.parentId
      }
    }

    // 创建同级节点
    const newTask = await taskStore.createTask({
      title: '新步骤',
      status: TaskStatus.PROJECT,
      parentId: parentId
    })

    await refreshMindMap()

    // 选中新节点并编辑
    const newNode = nodes.value.find(n => n.data.taskId === newTask.id)
    if (newNode) {
      selectedNode.value = newNode
      await nextTick()
      await startEditing(newNode, 'new')
    }
    return
  }

  // Delete - 删除节点
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedNode.value && !selectedNode.value.id.startsWith('root-')) {
      e.preventDefault()
      await deleteNode()
    }
    return
  }

  // 直接打字 - 编辑节点
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (selectedNode.value && !selectedNode.value.id.startsWith('root-')) {
      // 开始编辑，字符作为输入开始
      editingText.value = e.key
      isEditing.value = true
      editingNodeId.value = selectedNode.value.id

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
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
</style>

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

.mindmap-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mindmap-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.hint-bar {
  padding: 10px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint-keys {
  color: #999;
  font-size: 12px;
}

.mindmap-flow {
  flex: 1;
}

/* 内联编辑框 */
.inline-edit {
  position: absolute;
  z-index: 100;
  pointer-events: auto;
}

.edit-input {
  width: 150px;
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid #008080;
  border-radius: 20px;
  outline: none;
  box-shadow: 0 2px 8px rgba(0,128,128,0.3);
}

.edit-input:focus {
  border-color: #00a0a0;
  box-shadow: 0 2px 12px rgba(0,128,128,0.4);
}

@media (max-width: 768px) {
  .project-container {
    flex-direction: column;
  }

  .project-sidebar {
    width: 100%;
    max-height: 200px;
  }

  .hint-bar {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
