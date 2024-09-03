// preinstall模板
async function preInstall({ execSql }) {
  // await execSql("CREATE TABLE IF NOT EXISTS `test` (`id` bigint, `type` bigint) ENGINE=InnoDB CHARSET=utf8mb4")
}

module.exports = preInstall