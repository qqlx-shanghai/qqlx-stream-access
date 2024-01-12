import { sign, verify } from "jsonwebtoken";
import { Injectable } from "@nestjs/common";

import {
    StreamUser,
    PATH_STREAM_LOG,
    getStreamUserDto,
    getStreamUserRes,
    VARCHAR50_PG,
    ENUM_ERROR_CODE,
    UserInfo,
    UserEmail,
    RELATIONS_STREAM_USER_WECHAT,
    RELATIONS_STREAM_USER_TELECOM,
    RELATIONS_STREAM_USER_EMAIL,
    ENUM_STREAM_LOG,
    _Owner,
} from "qqlx-core";
import {
    toNumber,
    toString,
    ToResponse,
    getPageDto,
    getConditionMatchStr,
    StreamLogSchema,
    StreamUserSchema,
    getErrorTranslate,
    UserWeChatSchema,
    UserTelecomSchema,
    UserEmailSchema,
} from "qqlx-cdk";
import { DropletHostRpc, StreamLogRpc, getLocalNetworkIPs, getUUID32 } from "qqlx-sdk";

import { StreamUserAccessDao, StreamUserAccessGroupDao } from "./user-access.dao";

@Injectable()
export class StreamAccessService {

    constructor(
        //
        private readonly DropletHostRpc: DropletHostRpc,
        private readonly StreamLogRpc: StreamLogRpc,
        private readonly StreamUserAccessDao: StreamUserAccessDao,
        private readonly StreamUserAccessGroupDao: StreamUserAccessGroupDao
    ) {
    }
}
