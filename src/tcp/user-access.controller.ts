import { Controller, Query, Body, Get, Post, Patch } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";

import { StreamLog, PATH_STREAM_USER, getStreamUserDto, getStreamUserRes, UserInfo, Response, _Owner } from "qqlx-core";
import { toNumber, toString, ToResponse, getPageDto, getResponseData } from "qqlx-cdk";
import { getLocalNetworkIPs, DropletHostRpc } from "qqlx-sdk";

@Controller()
export default class {
    constructor() {
    }
}
