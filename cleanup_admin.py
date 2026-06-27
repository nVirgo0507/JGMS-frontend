import os
import re

file_path = r"D:\SWPFE\JGMS-frontend\src\pages\Admin\ManageProjects.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the ConfigureJiraModal block (lines 90-185 roughly)
# We can use regex to find function ConfigureJiraModal and remove until the next function
content = re.sub(r'function ConfigureJiraModal.*?^function GroupIntegrationRow', 'function GroupIntegrationRow', content, flags=re.MULTILINE | re.DOTALL)

# 2. Remove useState for jiraModal
content = re.sub(r'const \[jiraModal, setJiraModal\]\s*=\s*useState\(false\);\n', '', content)

# 3. Remove the Configure/Edit button
content = re.sub(r'<Button size="small" icon={<ApiOutlined />} onClick=\{\(\) => setJiraModal\(true\)\}>\s*\{jiraConfig \? "Edit" : "Configure"\}\s*</Button>', '', content)

# 4. Remove the JiraModal component instantiation
jira_modal_usage = r"""      <JiraModal
        open={jiraModal}
        groupCode={group.groupCode}
        existing={jiraConfig}
        onClose={() => setJiraModal(false)}
        onDone={loadJira}
      />"""
content = content.replace(jira_modal_usage, '')

# 5. Remove the "Not configured. Click Configure to set up Jira." text
content = content.replace(
    'Not configured. Click Configure to set up Jira.',
    'Not configured. The Team Leader must connect Jira from their dashboard.'
)

# 6. Remove the legacy email and API token fields from the view if we don't want to show them
content = content.replace(
    '<Descriptions.Item label="Email">{jiraConfig.jiraEmail}</Descriptions.Item>',
    ''
)
content = content.replace(
    '<Descriptions.Item label="URL">{jiraConfig.jiraUrl}</Descriptions.Item>',
    ''
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Admin dashboard cleaned up!")
