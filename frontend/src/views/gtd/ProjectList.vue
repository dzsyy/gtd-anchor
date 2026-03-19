<template>
  <div class="project-page">
    <h2>项目清单</h2>
    <p class="subtitle">点击项目查看思维导图，分解你的任务</p>

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
          <div id="mindmap" ref="mindmapRef"></div>
          <div class="mindmap-toolbar">
            <el-button size="small" @click="addChildNode">添加子步骤</el-button>
            <el-button size="small" type="danger" @click="deleteSelectedNode" :disabled="!selectedNode || selectedNode.id === selectedProject.id">
              删除选中
            </el-button>
          </div>
        </div>
        <el-empty v-else description="选择一个项目开始分解" :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { More, Plus, Folder } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MindElixir from 'mind-elixir'

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
const mindmapRef = ref<HTMLElement | null>(null)
let mindInstance: any = null
const selectedNode = ref<any>(null)

const selectProject = async (project: Task) => {
  selectedProject.value = project
  // 获取子任务
  const subTasks = await taskStore.fetchTasksByStatus(TaskStatus.PROJECT)

  await nextTick()
  initMindMap(project, subTasks || [])
}

// 初始化思维导图
const initMindMap = (project: Task, subTasks: Task[]) => {
  if (!mindmapRef.value) return

  // 构建思维导图数据
  const children = subTasks.map((task) => ({
    id: `sub_${task.id}`,
    topic: task.title,
    taskId: task.id
  }))

  const data = {
    nodeData: {
      id: String(project.id),
      topic: project.title,
      children: children
    }
  }

  // 如果已有实例，先销毁
  if (mindInstance) {
    mindInstance.destroy()
  }

  mindInstance = new MindElixir({
    el: mindmapRef.value,
    direction: 1,
    theme: 'light' as any,
    contextMenu: false,
    toolBar: false
  })

  mindInstance.init(data)

  // 监听节点选中
  mindInstance.on('selectNode', (node: any) => {
    selectedNode.value = node
  })
}

// 添加子节点
const addChildNode = () => {
  if (!mindInstance || !selectedProject.value) return

  const newTopic = prompt('请输入子步骤名称：')
  if (!newTopic?.trim()) return

  // 创建子任务
  taskStore.createTask({
    title: newTopic.trim(),
    status: TaskStatus.PROJECT,
    parentId: selectedProject.value.id
  }).then(() => {
    // 刷新思维导图
    selectProject(selectedProject.value!)
    ElMessage.success('子步骤已添加')
  })
}

// 删除选中节点
const deleteSelectedNode = async () => {
  if (!selectedNode.value || selectedNode.value.id === String(selectedProject.value?.id)) {
    ElMessage.warning('不能删除根节点')
    return
  }

  await ElMessageBox.confirm('确定要删除这个子步骤吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  const taskId = selectedNode.value?.taskId
  if (taskId) {
    await taskStore.deleteTask(taskId)
    selectProject(selectedProject.value!)
    ElMessage.success('已删除')
  }
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
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mindmap-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mindmap-wrapper #mindmap {
  flex: 1;
  min-height: 400px;
}

.mindmap-toolbar {
  padding: 12px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .project-container {
    flex-direction: column;
  }

  .project-sidebar {
    width: 100%;
    max-height: 200px;
  }

  .mindmap-wrapper #mindmap {
    min-height: 300px;
  }
}
</style>
