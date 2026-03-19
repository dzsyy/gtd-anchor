<template>
  <div class="project-page">
    <h2>项目清单</h2>
    <p class="subtitle">选择项目 → 树状图展示，支持拖拽</p>

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
          <Vue3TreeOrg
            v-if="treeData.id"
            :data="treeData"
            :config="treeConfig"
            @node-click="onNodeClick"
            @node-drop="onNodeDrop"
          >
            <template #default="{ data }">
              <div class="custom-node" @dblclick.stop="startEdit(data)">
                {{ data.label }}
              </div>
            </template>
          </Vue3TreeOrg>
        </div>
        <el-empty v-else description="选择一个项目开始分解" :image-size="80" />
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editVisible" title="编辑节点" width="400px">
      <el-input v-model="editLabel" placeholder="节点名称" @keydown.enter="confirmEdit" />
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { More, Plus, Folder } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Vue3TreeOrg from 'vue3-tree-org'
import 'vue3-tree-org/lib/vue3-tree-org.css'

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
const allSubTasks = ref<Task[]>([])

// 树形数据
interface TreeNode {
  id: string
  label: string
  taskId?: number
  children?: TreeNode[]
}

const treeData = ref<TreeNode>({ id: '', label: '' })

// 树状图配置
const treeConfig = reactive({
  nodeWidth: 200,
  nodeHeight: 40,
  levelWidth: 80,
  renderMode: 'tree',
  draggable: true,
  collapsible: true,
  expandLevel: 1,
  showNodeId: false
})

const selectProject = async (project: Task) => {
  selectedProject.value = project
  allSubTasks.value = await taskStore.fetchTasksByStatus(TaskStatus.PROJECT)
  buildTree(project)
}

// 构建树形数据
const buildTree = (project: Task) => {
  const subTasks = allSubTasks.value.filter(t => t.parentId === project.id)

  const buildChildren = (parentId: number | undefined): TreeNode[] => {
    if (!parentId) return []
    return subTasks
      .filter(t => t.parentId === parentId)
      .map(task => ({
        id: `task-${task.id}`,
        label: task.title,
        taskId: task.id,
        children: buildChildren(task.id!)
      }))
  }

  treeData.value = {
    id: `root-${project.id}`,
    label: project.title,
    taskId: project.id!,
    children: buildChildren(project.id!)
  }
}

// 点击节点
const onNodeClick = (data: TreeNode) => {
  console.log('click node:', data)
}

// 节点拖拽 - 改变层级关系
const onNodeDrop = async (data: TreeNode, dropNode: TreeNode, dropPosition: number) => {
  if (!data.taskId || !selectedProject.value) return

  let newParentId: number | undefined

  if (dropPosition === 0) {
    newParentId = dropNode.taskId || selectedProject.value.id
  } else {
    const dropTask = allSubTasks.value.find(t => t.id === dropNode.taskId)
    newParentId = dropTask?.parentId || selectedProject.value.id
  }

  if (newParentId) {
    const task = allSubTasks.value.find(t => t.id === data.taskId)
    if (task) {
      await taskStore.updateTask(data.taskId, { ...task, parentId: newParentId })
      await refreshTree()
      ElMessage.success('已更新层级')
    }
  }
}

// 编辑
const editVisible = ref(false)
const editLabel = ref('')
const editingNode = ref<TreeNode | null>(null)

const startEdit = (data: TreeNode) => {
  if (data.id.startsWith('root-')) {
    ElMessage.warning('不能编辑项目名称')
    return
  }
  editingNode.value = data
  editLabel.value = data.label
  editVisible.value = true
}

const confirmEdit = async () => {
  if (!editLabel.value.trim() || !editingNode.value?.taskId) return

  const task = allSubTasks.value.find(t => t.id === editingNode.value?.taskId)
  if (task && task.id) {
    await taskStore.updateTask(task.id, { ...task, title: editLabel.value.trim() })
    await refreshTree()
  }

  editVisible.value = false
  editingNode.value = null
}

// 刷新树
const refreshTree = async () => {
  if (!selectedProject.value) return
  allSubTasks.value = await taskStore.fetchTasksByStatus(TaskStatus.PROJECT)
  buildTree(selectedProject.value)
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

onMounted(() => {
  taskStore.fetchAllTasks()
})
</script>

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
  overflow: hidden;
}

.tree-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* 自定义节点样式 */
.custom-node {
  padding: 8px 16px;
  background: linear-gradient(135deg, #008080 0%, #006666 100%);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  white-space: nowrap;
}

.custom-node:hover {
  transform: scale(1.05);
}

/* 树状图容器样式 */
:deep(.tree-org) {
  width: 100%;
  height: 100%;
}

:deep(.tree-org-node) {
  cursor: pointer;
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
