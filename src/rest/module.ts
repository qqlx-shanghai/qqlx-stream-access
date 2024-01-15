import { Module, Injectable } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DropletHost, DROPLET_SHANGHAI_POSTGRESQL } from "qqlx-core";
import { StreamUserSchema, StreamUserAccessGroupSchema, StreamUserAccessSchema, UserWeChatSchema, UserTelecomSchema, UserEmailSchema } from "qqlx-cdk";
import { getLocalNetworkIPs, DropletHostRpc, StreamLogRpc, StreamUserRpc } from "qqlx-sdk";

import { DropletModule } from "../_/droplet.module";
import { StreamUserAccessDao, StreamUserAccessGroupDao } from "./user-access.dao";
import { StreamAccessService } from "./user-access.service";

import { UserAccessGroupController } from "./user-access-group.controller";
import { UserAccessController } from "./user-access.controller";

export const REST_PORT = 8004;

/** 相关解释
 * @imports 导入一个模块中 exports 的内容，放入公共资源池中
 * @providers 将公共资源池中的内容，放入应用池 controller 之中，所以其才能够使用/注入各种内容
 * @inject 将公共资源池中的内容，放入应用池 controller 之中，所以其才能够使用/注入各种内容
 * @controllers 指明哪些应用需要被加载
 */
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [DropletModule],
            inject: [DropletHostRpc],
            useFactory: async (pondDropletMessenger: DropletHostRpc) => {
                const node_db = await pondDropletMessenger.get({ key: DROPLET_SHANGHAI_POSTGRESQL });
                const mess = node_db?.remark?.split(";") || [];
                const dbname = mess[0];
                const username = mess[1];
                const passwd = mess[2];

                console.log("\n");
                console.log(`🌊 qqlx-droplet-host:get - ${DROPLET_SHANGHAI_POSTGRESQL}`);
                console.log(`🌊 rest.module.ts at ${REST_PORT} ✔`);
                console.log("\n");

                return {
                    type: "postgres",
                    host: node_db?.lan_ip,
                    port: node_db?.port,
                    username: username,
                    password: passwd,
                    database: dbname,
                    logging: false,
                    entities: [
                        StreamUserSchema, UserWeChatSchema, UserTelecomSchema, UserEmailSchema,
                        StreamUserAccessGroupSchema, StreamUserAccessSchema
                    ],
                };
            },
        }),
        TypeOrmModule.forFeature([
            StreamUserSchema, UserWeChatSchema, UserTelecomSchema, UserEmailSchema,
            StreamUserAccessGroupSchema, StreamUserAccessSchema
        ]),
    ],
    providers: [DropletHostRpc, StreamLogRpc, StreamUserRpc, StreamUserAccessDao, StreamUserAccessGroupDao],
    controllers: [UserAccessGroupController, UserAccessController],
})
export class RestModule { }
