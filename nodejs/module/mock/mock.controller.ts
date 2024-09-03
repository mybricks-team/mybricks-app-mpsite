import {
  Body,
  Controller,
  Inject,
  Get,
  Post,
  Req,
  Query,
  Header,
  UseInterceptors
} from "@nestjs/common";
import MockService from "./mock.service";
import { name as pkgName } from "./../../../package.json";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import axios from 'axios';
import areaData from "./areaData";


@Controller("api/mock")
export default class MockController {
  @Inject(MockService)
  mockService: MockService;

  @Post("/areaData")
  async areaData() {
    return {
      code: 1,
      data: areaData
    };
  }

}