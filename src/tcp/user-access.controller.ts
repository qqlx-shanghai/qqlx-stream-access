import { Controller, Query, Body, Get, Post, Patch } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";

import { StreamLog, PATH_STREAM_USER_ACCESS, getStreamUserDto, getStreamUserRes, UserInfo, Response, _Owner } from "qqlx-core";
import { toNumber, toString, ToResponse, getPageDto, getResponseData, getConditionMatchStr, getConditionMatchInteger } from "qqlx-cdk";
import { getLocalNetworkIPs, DropletHostRpc } from "qqlx-sdk";
import { StreamUserAccessDao, StreamUserAccessGroupDao } from "src/rest/user-access.dao";
import { StreamAccessService } from "src/rest/user-access.service";

@Controller()
export default class {
    constructor(
        private readonly StreamAccessService: StreamAccessService,
        private readonly StreamUserAccessGroupDao: StreamUserAccessGroupDao,
        private readonly StreamUserAccessDao: StreamUserAccessDao,
    ) { }

    // 判断某个用户，是否具有某个资源的权限
    @MessagePattern(`${PATH_STREAM_USER_ACCESS}/scope/valid`)
    @ToResponse()
    async valid (dto: { uuid32: string; scope: string }): Promise<Boolean> {
        const { uuid32, scope } = dto

        // 0.权限组是否存在
        const exist = await this.StreamAccessService.getGroup(scope)
        if (!exist) throw new Error(`错误（找不到权限组 ${scope}）`)

        // 1.是否直接拥有此权限组
        const countOwner = await this.StreamUserAccessGroupDao.count([
            getConditionMatchStr('uuid32', uuid32),
            getConditionMatchStr('scope', exist.scope)
        ])
        if (countOwner > 0) return true

        // 2.是否拥有权限令牌
        const countAccess = await this.StreamUserAccessDao.count([
            getConditionMatchStr('uuid32', uuid32),
            getConditionMatchInteger('gid', exist.id)
        ])
        if (countAccess > 0) return true

        throw new Error(`权限不足（不在权限组 ${scope} 之中）`)
    }
}
