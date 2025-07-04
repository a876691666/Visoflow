#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 递归扫描目录获取所有文件
function getAllFiles(dirPath, arrayOfFiles = []) {
	const files = fs.readdirSync(dirPath);

	files.forEach(file => {
		const filePath = path.join(dirPath, file);
		if (fs.statSync(filePath).isDirectory()) {
			arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
		} else {
			arrayOfFiles.push(filePath);
		}
	});

	return arrayOfFiles;
}

// 检查Vue文件是否存在对应的TSX文件
function findMigratedComponents() {
	console.log('🔍 扫描所有文件夹，查找已迁移的组件...\n');

	const srcPath = path.join(process.cwd(), 'src');
	const allFiles = getAllFiles(srcPath);

	// 获取所有Vue文件
	const vueFiles = allFiles.filter(file => file.endsWith('.vue'));

	// 获取所有TSX文件
	const tsxFiles = allFiles.filter(file => file.endsWith('.tsx'));

	console.log(`📊 发现 ${vueFiles.length} 个Vue文件，${tsxFiles.length} 个TSX文件\n`);

	const migratedComponents = [];

	vueFiles.forEach(vueFile => {
		// 获取相对于src的路径
		const relativePath = path.relative(srcPath, vueFile);

		// 构建对应的TSX文件路径
		const tsxFile = vueFile.replace('.vue', '.tsx');

		// 检查TSX文件是否存在
		if (fs.existsSync(tsxFile)) {
			migratedComponents.push({
				vue: vueFile,
				tsx: tsxFile,
				name: path.basename(vueFile, '.vue')
			});
		}
	});

	return migratedComponents;
}

// 安全删除TSX文件
function safeDeleteTsx(tsxPath, componentName) {
	try {
		// 创建备份
		const backupPath = tsxPath + '.backup';
		fs.copyFileSync(tsxPath, backupPath);

		// 删除原文件
		fs.unlinkSync(tsxPath);

		console.log(`✅ 已删除: ${path.relative(process.cwd(), tsxPath)}`);

		// 删除备份（如果成功）
		setTimeout(() => {
			if (fs.existsSync(backupPath)) {
				fs.unlinkSync(backupPath);
			}
		}, 1000);

		return true;
	} catch (error) {
		console.error(`❌ 删除失败 ${componentName}: ${error.message}`);
		return false;
	}
}

// 主函数
function main() {
	console.log('🚀 开始清理已迁移的TSX文件...\n');

	const migratedComponents = findMigratedComponents();

	if (migratedComponents.length === 0) {
		console.log('✨ 没有发现需要清理的TSX文件（所有组件都已完成迁移或清理）');
		return;
	}

	console.log(`📋 发现 ${migratedComponents.length} 个已迁移的组件：\n`);

	// 显示将要删除的文件列表
	migratedComponents.forEach((component, index) => {
		const relativePath = path.relative(process.cwd(), component.tsx);
		console.log(`${index + 1}. ${component.name} - ${relativePath}`);
	});

	console.log('\n🗑️  开始删除TSX文件...\n');

	let deletedCount = 0;
	let failedCount = 0;

	// 删除文件
	migratedComponents.forEach(component => {
		const success = safeDeleteTsx(component.tsx, component.name);
		if (success) {
			deletedCount++;
		} else {
			failedCount++;
		}
	});

	// 显示结果
	console.log('\n📊 清理完成！');
	console.log(`✅ 成功删除: ${deletedCount} 个文件`);
	if (failedCount > 0) {
		console.log(`❌ 删除失败: ${failedCount} 个文件`);
	}

	// 显示剩余的TSX文件
	const remainingTsxFiles = getAllFiles(path.join(process.cwd(), 'src'))
		.filter(file => file.endsWith('.tsx'))
		.filter(file => !file.includes('node_modules'));

	console.log(`\n📄 剩余TSX文件数量: ${remainingTsxFiles.length}`);

	if (remainingTsxFiles.length > 0 && remainingTsxFiles.length <= 20) {
		console.log('\n📝 剩余的TSX文件：');
		remainingTsxFiles.forEach((file, index) => {
			const relativePath = path.relative(process.cwd(), file);
			console.log(`${index + 1}. ${relativePath}`);
		});
	}
}

// 运行脚本
if (require.main === module) {
	main();
}

module.exports = { findMigratedComponents, safeDeleteTsx }; 