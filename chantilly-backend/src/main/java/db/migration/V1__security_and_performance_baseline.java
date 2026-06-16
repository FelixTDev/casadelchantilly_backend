package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class V1__security_and_performance_baseline extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();

        createRevokedTokensTable(connection);
        createAuthRateLimitsTable(connection);

        ensureIndexIfTableExists(connection, "pedidos", "idx_pedidos_estado_creado_en", "create index idx_pedidos_estado_creado_en on pedidos (estado, creado_en)");
        ensureIndexIfTableExists(connection, "pedidos", "idx_pedidos_modalidad_creado_en", "create index idx_pedidos_modalidad_creado_en on pedidos (modalidad_entrega, creado_en)");
        ensureIndexIfTableExists(connection, "pagos", "idx_pagos_estado_metodo", "create index idx_pagos_estado_metodo on pagos (estado_pago, metodo_pago)");
        ensureIndexIfTableExists(connection, "pagos", "idx_pagos_pedido_id", "create index idx_pagos_pedido_id on pagos (id_pedido)");
        ensureIndexIfTableExists(connection, "reclamos", "idx_reclamos_estado_tipo_creado", "create index idx_reclamos_estado_tipo_creado on reclamos (estado, tipo, creado_en)");
        ensureIndexIfTableExists(connection, "historial_estados", "idx_historial_pedido_estado", "create index idx_historial_pedido_estado on historial_estados (id_pedido, estado)");
    }

    private void createRevokedTokensTable(Connection connection) throws SQLException {
        if (tableExists(connection, "revoked_tokens")) {
            ensureIndex(connection, "revoked_tokens", "uk_revoked_tokens_hash", "create unique index uk_revoked_tokens_hash on revoked_tokens (token_hash)");
            ensureIndex(connection, "revoked_tokens", "idx_revoked_tokens_expires_at", "create index idx_revoked_tokens_expires_at on revoked_tokens (expires_at)");
            return;
        }

        try (Statement statement = connection.createStatement()) {
            statement.execute("""
                create table revoked_tokens (
                    id bigint not null auto_increment,
                    token_hash varchar(64) not null,
                    expires_at datetime not null,
                    revoked_at datetime not null,
                    primary key (id),
                    unique key uk_revoked_tokens_hash (token_hash),
                    key idx_revoked_tokens_expires_at (expires_at)
                )
            """);
        }
    }

    private void createAuthRateLimitsTable(Connection connection) throws SQLException {
        if (tableExists(connection, "auth_rate_limits")) {
            ensureIndex(connection, "auth_rate_limits", "uk_auth_rate_limits_action_subject", "create unique index uk_auth_rate_limits_action_subject on auth_rate_limits (action, subject_hash)");
            ensureIndex(connection, "auth_rate_limits", "idx_auth_rate_limits_action_blocked", "create index idx_auth_rate_limits_action_blocked on auth_rate_limits (action, blocked_until)");
            return;
        }

        try (Statement statement = connection.createStatement()) {
            statement.execute("""
                create table auth_rate_limits (
                    id bigint not null auto_increment,
                    action varchar(32) not null,
                    subject_hash varchar(64) not null,
                    attempts integer not null,
                    window_started_at datetime not null,
                    blocked_until datetime null,
                    created_at datetime not null,
                    primary key (id),
                    unique key uk_auth_rate_limits_action_subject (action, subject_hash),
                    key idx_auth_rate_limits_action_blocked (action, blocked_until)
                )
            """);
        }
    }

    private boolean tableExists(Connection connection, String tableName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet resultSet = metaData.getTables(connection.getCatalog(), null, tableName, null)) {
            if (resultSet.next()) {
                return true;
            }
        }

        try (ResultSet resultSet = metaData.getTables(connection.getCatalog(), null, tableName.toUpperCase(), null)) {
            return resultSet.next();
        }
    }

    private void ensureIndex(Connection connection, String tableName, String indexName, String sql) throws SQLException {
        if (indexExists(connection, tableName, indexName)) {
            return;
        }

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.execute();
        }
    }

    private void ensureIndexIfTableExists(Connection connection, String tableName, String indexName, String sql) throws SQLException {
        if (!tableExists(connection, tableName)) {
            return;
        }
        ensureIndex(connection, tableName, indexName, sql);
    }

    private boolean indexExists(Connection connection, String tableName, String indexName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet resultSet = metaData.getIndexInfo(connection.getCatalog(), null, tableName, false, false)) {
            while (resultSet.next()) {
                String current = resultSet.getString("INDEX_NAME");
                if (current != null && current.equalsIgnoreCase(indexName)) {
                    return true;
                }
            }
        }

        try (ResultSet resultSet = metaData.getIndexInfo(connection.getCatalog(), null, tableName.toUpperCase(), false, false)) {
            while (resultSet.next()) {
                String current = resultSet.getString("INDEX_NAME");
                if (current != null && current.equalsIgnoreCase(indexName)) {
                    return true;
                }
            }
        }
        return false;
    }
}
