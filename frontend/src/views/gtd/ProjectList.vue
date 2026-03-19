<template>
  <div class="project-page">
    <h2>项目清单</h2>
    <p class="subtitle">选择项目 → 点击节点 → Tab添加子步骤 / Enter添加同级步骤 / 双击编辑</p>

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
            <span v-if="selectedNode">已选中: {{ selectedNode.data?.label || '根节点' }}</span>
            <span v-else>点击选择一个节点</span>
            <span class="hint-keys">Tab: 添加子节点 | Enter: 添加同级 | Delete: 删除</span>
          </div>

          <VueFlow
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

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'edit' ? '编辑步骤' : '添加步骤'" width="400px">
      <el-input
        v-model="nodeTitle"
        placeholder="请输入步骤名称"
        ref="inputRef"
        @keydown.enter="confirmAction"
        @keydown.tab.prevent="handleTab"
      />
      <div class="dialog-hint">
        <span v-if="dialogMode === 'add'">按 Enter 添加同级步骤，按 Tab 添加子步骤</span>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="dialogMode === 'edit'" type="danger" @click="deleteNode">删除</el-button>
          <div class="footer-right">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAction">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { More, Plus, Folder } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { Node, Edge } from '@vue-flow/core'

const taskStore = useTaskStore()
const projects = computed(() => taskStore.tasksByStatus[TaskStatus.PROJECT] || [])

useVueFlow()

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

// 对话框
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const nodeTitle = ref('')
const inputRef = ref()

const selectProject = async (project: Task) => {
  selectedProject.value = project
  selectedNode.value = null
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
}

// 点击节点 - 选中或编辑
const onNodeClick = (event: any) => {
  const node = event.node
  selectedNode.value = node

  // 如果是根节点，不允许编辑
  if (node.id.startsWith('root-')) {
    return
  }

  // 显示编辑对话框
  dialogMode.value = 'edit'
  nodeTitle.value = node.data.label
  dialogVisible.value = true

  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Tab - 添加子节点
const handleTab = async () => {
  if (!nodeTitle.value.trim()) {
    ElMessage.warning('请先输入步骤名称')
    return
  }

  // 获取当前选中的节点作为父节点
  const parentNode = selectedNode.value
  if (!parentNode || parentNode.id.startsWith('root-')) {
    ElMessage.warning('请先选择一个子节点')
    return
  }

  const taskId = parentNode.data.taskId

  // 创建子任务
  await taskStore.createTask({
    title: nodeTitle.value.trim(),
    status: TaskStatus.PROJECT,
    parentId: taskId
  })

  nodeTitle.value = ''
  dialogVisible.value = false
  ElMessage.success('子步骤已添加')

  // 刷新
  await refreshMindMap()
}

// 确认添加/编辑
const confirmAction = async () => {
  if (!nodeTitle.value.trim() || !selectedProject.value) return

  if (dialogMode.value === 'edit' && selectedNode.value) {
    // 编辑
    const taskId = selectedNode.value.data.taskId
    if (taskId) {
      const task = allSubTasks.value.find(t => t.id === taskId)
      if (task) {
        await taskStore.updateTask(taskId, { ...task, title: nodeTitle.value.trim() })
      }
    }
  } else {
    // 添加 - 作为根节点的子节点
    await taskStore.createTask({
      title: nodeTitle.value.trim(),
      status: TaskStatus.PROJECT,
      parentId: selectedProject.value.id
    })
  }

  nodeTitle.value = ''
  dialogVisible.value = false

  // 刷新
  await refreshMindMap()
}

// 删除节点
const deleteNode = async () => {
  if (!selectedNode.value) return

  const taskId = selectedNode.value.data.taskId
  if (!taskId) return

  await ElMessageBox.confirm('确定要删除这个步骤吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  await taskStore.deleteTask(taskId)
  dialogVisible.value = false
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
  // 如果有对话框打开，不处理
  if (dialogVisible.value) return

  // 如果没有选中项目或节点，不处理
  if (!selectedProject.value || !selectedNode.value) return

  // Tab - 添加子节点
  if (e.key === 'Tab') {
    e.preventDefault()
    e.stopPropagation()

    // 显示添加对话框，模式为添加子节点
    dialogMode.value = 'add'
    nodeTitle.value = ''
    dialogVisible.value = true

    nextTick(() => {
      inputRef.value?.focus()
    })
    return
  }

  // Enter - 添加同级节点
  if (e.key === 'Enter') {
    e.preventDefault()
    e.stopPropagation()

    dialogMode.value = 'add'
    nodeTitle.value = ''
    dialogVisible.value = true

    nextTick(() => {
      inputRef.value?.focus()
    })
    return
  }

  // Delete - 删除节点
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // 如果焦点在输入框，不处理
    if ((e.target as HTMLElement).tagName === 'INPUT') return

    e.preventDefault()
    await deleteNode()
  }
}

onMounted(() => {
  taskStore.fetchAllTasks()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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

.dialog-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}

.footer-right {
  display: flex;
  gap: 8px;
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
