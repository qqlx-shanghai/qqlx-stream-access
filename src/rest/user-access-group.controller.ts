import { Controller, Query, Body, Get, Post, Patch, UseGuards, Req } from "@nestjs/common";
import { createTransport, Transporter } from "nodemailer";

import {
    StreamUser, PATH_STREAM_USER_ACCESS_GROUP,
    postStreamAccessGroupDto, postStreamAccessGroupRes, _Owner,
    getStreamAccessGroupDto, getStreamAccessGroupDtoRes, ENUM_STREAM_LOG,
} from "qqlx-core";
import { toNumber, toString, ToResponse, getPageDto, getConditionMatchStr, UserEmailSchema } from "qqlx-cdk";
import { DropletHostRpc, getLocalNetworkIPs, getRandomString, StreamLogRpc, UserGuard } from "qqlx-sdk";

import { StreamUserAccessDao, StreamUserAccessGroupDao } from "./user-access.dao";

@Controller(PATH_STREAM_USER_ACCESS_GROUP)
@UseGuards(UserGuard)
export class UserAccessGroupController {

    constructor(
        //
        private readonly DropletHostRpc: DropletHostRpc,
        private readonly StreamLogRpc: StreamLogRpc,
        private readonly StreamUserAccessDao: StreamUserAccessDao,
        private readonly StreamUserAccessGroupDao: StreamUserAccessGroupDao
    ) { }

    @Get()
    async get (@Body('dto') dto: getStreamAccessGroupDto, @Body('Owner') Owner: _Owner): Promise<getStreamAccessGroupDtoRes> {

        const uuid32 = Owner.uuid32
        const qb = this.StreamUserAccessGroupDao.getQueryBuilder()
            .where(`${this.StreamUserAccessGroupDao.relations_name}.uuid32 = :uuid32`, { uuid32 })
            .leftJoinAndSelect(`${this.StreamUserAccessGroupDao.relations_name}.joinOwner`, `joinOwner`)
            .leftJoinAndSelect(`joinOwner.joinWeChatList`, `joinWeChatList`)
            .leftJoinAndSelect(`joinOwner.joinTelecomList`, `joinTelecomList`)
            .leftJoinAndSelect(`joinOwner.joinEmailList`, `joinEmailList`)

        // async
        this.StreamLogRpc.simplePost(ENUM_STREAM_LOG.DEBUG, `${this.constructor.name}:${this.get.name}`, qb.getSql())

        const groupList = await qb.getMany()
        return groupList;
    }

    @Post()
    async post (@Body('dto') dto: postStreamAccessGroupDto, @Body("Owner") Owner: _Owner): Promise<postStreamAccessGroupRes> {

        const { schema } = dto
        schema.uuid32 = Owner.uuid32
        const group = await this.StreamUserAccessGroupDao.insertOne(schema)

        return null;
    }
}
