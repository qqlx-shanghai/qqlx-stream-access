import { Module, Injectable } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DropletHost, DROPLET_SHANGHAI_POSTGRESQL, DROPLET_STREAM_USER } from "qqlx-core";
import { StreamUserAccessGroupSchema, StreamUserAccessSchema } from "qqlx-cdk";
import { getLocalNetworkIPs, DropletHostRpc, StreamLogRpc } from "qqlx-sdk";

import { DropletModule } from "../_/droplet.module";
import StreamUserAccessController from "./user-access.controller";
import { StreamUserAccessDao, StreamUserAccessGroupDao } from "src/rest/user-access.dao";

export const TCP_PORT = 6004

/** 相关解释
 * @imports 导入一个模块中 exports 的内容，放入公共资源池中
 * @providers 以及 inject，都是将公共资源池中的内容，放入应用池 controller 之中，所以其才能够使用/注入各种内容
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
                console.log(`🌸 qqlx-droplet-host:get - ${DROPLET_SHANGHAI_POSTGRESQL}`);

                const ips = getLocalNetworkIPs();
                const droplet: DropletHost = pondDropletMessenger.getSchema();
                droplet.lan_ip = ips[0].ip;
                droplet.port = TCP_PORT;
                pondDropletMessenger.keepAlive(DROPLET_STREAM_USER, droplet); // async
                console.log(`🌸 qqlx-droplet-host:puting... - ${DROPLET_STREAM_USER}:${droplet.lan_ip}:${droplet.port}`);
                console.log(`🌸 tcp.module.ts at ${TCP_PORT} ✔`);
                console.log("\n");

                return {
                    type: "postgres",
                    host: node_db?.lan_ip,
                    port: node_db?.port,
                    username: username,
                    password: passwd,
                    database: dbname,
                    logging: false,
                    entities: [StreamUserAccessGroupSchema, StreamUserAccessSchema],
                };
            },
        }),
        TypeOrmModule.forFeature([StreamUserAccessGroupSchema, StreamUserAccessSchema]),
    ],
    providers: [DropletHostRpc, StreamLogRpc, StreamUserAccessDao, StreamUserAccessGroupDao],
    controllers: [StreamUserAccessController],
})
export class TcpModule { }
