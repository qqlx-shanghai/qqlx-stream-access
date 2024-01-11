import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { StreamUserAccessGroup, RELATIONS_STREAM_USER_ACCESS_GROUP, StreamUserAccess, RELATIONS_STREAM_USER_ACCESS } from "qqlx-core";
import { toNumber, toString, StreamUserAccessGroupSchema, StreamUserAccessSchema } from "qqlx-cdk";
import { getLocalNetworkIPs, PgDao } from "qqlx-sdk";

@Injectable()
export class StreamUserAccessGroupDao extends PgDao<StreamUserAccessGroup> {
    constructor(
        @InjectRepository(StreamUserAccessGroupSchema)
        private readonly repo: Repository<StreamUserAccessGroup>
    ) {
        super({
            repository: repo,
            relations_name: RELATIONS_STREAM_USER_ACCESS_GROUP,
        });
    }
}