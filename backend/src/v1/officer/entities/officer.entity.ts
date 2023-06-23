import { ApiProperty } from "@nestjs/swagger";
import { UUID } from "crypto";
import { Office } from "../../office/entities/office.entity";
import { Person } from "../../person/entities/person.entity";
import { Entity, Column, OneToOne, JoinColumn, Unique, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
@Unique(["person_guid"])
export class Officer 
{
    @ApiProperty({
        example: "903f87c8-76dd-427c-a1bb-4d179e443252",
        description: "The guid for this officer",
      })
      @PrimaryGeneratedColumn("uuid")
      officer_guid: UUID;

      @ApiProperty({
        example: "903f87c8-76dd-427c-a1bb-4d179e443252",
        description: "The person for this officer",
      })
      @OneToOne(() => Person)
      @JoinColumn({name: "person_guid"})
      person_guid: Person;

      @ApiProperty({
        example: "DCC",
        description: "The office for this officer",
      })
      @ManyToOne(() => Office, { nullable: true })
      @JoinColumn({name: "office_guid"})
      office_guid: Office;
      
      @ApiProperty({
        example: "Charles",
        description: "The user id of this officer",
      })
      @Column({length: 32})
      user_id: string;
    
      @ApiProperty({
        example: "IDIR\mburns",
        description: "The id of the user that created the officer",
      })
      @Column({length: 32})
      create_user_id: string;
    
      @ApiProperty({
        example: "903f87c8-76dd-427c-a1bb-4d179e443252",
        description: "The unique guid of the user that created the officer",
      })
      @Column({type: "uuid"})
      create_user_guid: UUID;
    
      @ApiProperty({
        example: "2003-04-12 04:05:06",
        description: "The timestamp when the officer was created",
      })
      @Column()
      create_timestamp: Date;
    
      @ApiProperty({
        example: "IDIR\mburns",
        description: "The id of the user that last updated the officer",
      })
      @Column({length: 32})
      update_user_id: string;
    
      @ApiProperty({
        example: "903f87c8-76dd-427c-a1bb-4d179e443252",
        description: "The unique guid of the user that last updated the officer",
      })
      @Column({type: "uuid"})
      update_user_guid: UUID;
    
      @ApiProperty({
        example: "2003-04-12 04:05:06",
        description: "The timestamp when the officer was last updated",
      })
      @Column()
      update_timestamp: Date;
    
      @ApiProperty({
        example: "903f87c8-76dd-427c-a1bb-4d179e443252",
        description: "The keycloak guid for the officer",
      })
      @Column()
      auth_user_guid: UUID;

      constructor() {
    
      }
}
