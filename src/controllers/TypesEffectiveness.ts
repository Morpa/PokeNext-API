import { Request, Response } from 'express';

import { ApiResult, Type } from '../types';
import pokeApi from '../services/pokemonApi';
import { capitalizeFirstLetter } from '../utils';

type DemageRelations = {
  multiplier: string;
  type: string;
}[];

export default class TypesEffectiveness {
  public async show(request: Request, response: Response): Promise<Response> {
    const { type } = request.params;

    const { data: typesData } = await pokeApi.get<ApiResult>(`/type`);

    const { data: typeData } = await pokeApi.get<Type>(
      `/type/${type.toLowerCase()}`,
    );

    const allTypes = typesData.results;

    const damage_relations: DemageRelations = [];

    typeData.damage_relations.double_damage_from.map(damageType =>
      damage_relations.push({
        multiplier: '2x',
        type: capitalizeFirstLetter(damageType.name),
      }),
    );

    typeData.damage_relations.half_damage_from.map(damageType =>
      damage_relations.push({
        multiplier: '0.5x',
        type: capitalizeFirstLetter(damageType.name),
      }),
    );

    const leftTypes = allTypes.filter(
      ({ name }) =>
        !damage_relations.some(
          ({ type: TypeName }) => TypeName.toLocaleLowerCase() === name,
        ),
    );

    leftTypes.splice(leftTypes.length - 2);

    leftTypes.map(leftType =>
      damage_relations.push({
        multiplier: '1x',
        type: capitalizeFirstLetter(leftType.name),
      }),
    );

    return response.json(damage_relations);
  }
}
