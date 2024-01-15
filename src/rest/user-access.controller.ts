import { Controller, Query, Body, Get, Post, Patch, UseGuards, Req, Put, Delete } from "@nestjs/common";
import { createTransport, Transporter } from "nodemailer";

import {
    StreamUser, PATH_STREAM_USER_ACCESS_GROUP, _Owner,
    getStreamAccessDto, getStreamAccessRes, ENUM_STREAM_LOG, StreamUserAccess, deleteStreamAccessDto, deleteStreamAccessRes, ENUM_ERROR_CODE, postStreamAccessDto, postStreamAccessRes, PATH_STREAM_USER_ACCESS,
} from "qqlx-core";
import { toNumber, toString, ToResponse, getPageDto, getConditionMatchStr, UserEmailSchema, getConditionMatchEnum, isValid, getErrorTranslate } from "qqlx-cdk";
import { DropletHostRpc, getLocalNetworkIPs, getRandomString, StreamLogRpc, UserGuard } from "qqlx-sdk";

import { StreamUserAccessDao, StreamUserAccessGroupDao } from "./user-access.dao";

@Controller(PATH_STREAM_USER_ACCESS)
@UseGuards(UserGuard)
export class UserAccessController {

    constructor(
        //
        private readonly DropletHostRpc: DropletHostRpc,
        private readonly StreamLogRpc: StreamLogRpc,
        private readonly StreamUserAccessDao: StreamUserAccessDao,
        private readonly StreamUserAccessGroupDao: StreamUserAccessGroupDao
    ) { }

    @Post('/get')
    async get (@Body('dto') dto: getStreamAccessDto, @Body('Owner') Owner: _Owner): Promise<getStreamAccessRes> {

        const { key, value } = dto.gid
        if ((key as string) !== 'gid') throw new Error(`无法查询 ${key}:${value}`)

        const qb = this.StreamUserAccessDao.getQueryBuilder()

        if (value === -1) qb.where(`${this.StreamUserAccessDao.relations_name}.uuid32 = :uuid32`, { uuid32: Owner.uuid32 })
        else qb.where(`${this.StreamUserAccessDao.relations_name}.gid = :gid`, { gid: value })

        // async
        this.StreamLogRpc.simplePost(ENUM_STREAM_LOG.DEBUG, `${this.constructor.name}:${this.get.name}`, qb.getSql())

        return qb
            .leftJoinAndSelect(`${this.StreamUserAccessDao.relations_name}.joinOwner`, `joinOwner`)
            .leftJoinAndSelect(`${this.StreamUserAccessDao.relations_name}.joinStreamUserAccessGroup`, `joinStreamUserAccessGroup`)
            .getMany()
    }

    @Post()
    async post (@Body('dto') dto: postStreamAccessDto, @Body("Owner") Owner: _Owner): Promise<postStreamAccessRes> {

        const { schema } = dto
        if (toString(schema.gid).length < 1) throw new Error(`无法创建 gid:${schema.gid}`)

        schema.uuid32 = Owner.uuid32
        const group = await this.StreamUserAccessDao.insertOne(schema)

        return null;
    }

    @Delete()
    async delete (@Body('dto') dto: deleteStreamAccessDto, @Body('Owner') Owner: _Owner): Promise<deleteStreamAccessRes> {

        await this.StreamUserAccessDao.deleteOneById(dto.id);
        return null
    }
}
