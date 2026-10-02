import { createClient } from "./supabase/server";

export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

type SearchDataParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;


const client = await createClient();

const supabase = {
  client,
  queries: {
    getData: async (
      category: string,
      search: string = "*",
    ): Promise<QueryResult> => {
      const { data, error } = await client.from(category).select(search);
      if (error) {
        return { data: null, status: HTTP_STATUS.INTERNAL_SERVER_ERROR, error };
      }
      return { data, status: HTTP_STATUS.OK };
    },
  },
};

const database = {
  getProducts: async (): Promise<QueryResult> => {
    const { data, status, error } = await supabase.queries.getData("products");
    return { data, status, error };
  },
  getCategories: async (): Promise<QueryResult> => {
    const { data, status, error } =
      await supabase.queries.getData("categories");
    return { data, status, error };
  },
  searchData: async (params: SearchDataParams): Promise<QueryResult> => {
    if (!params) {
      return {
        data: null,
        status: HTTP_STATUS.BAD_REQUEST,
        error: "No search parameters provided",
      };
    }
    const resolvedParams = await params;

    const categoryParam = resolvedParams.category;
    const searchParam = resolvedParams.search;

    const selectedCategory =
      typeof categoryParam === "string" ? categoryParam : undefined;
    const searchQuery =
      typeof searchParam === "string" ? searchParam : undefined;

    const {
      data: categories,
      status: categoryStatus,
      error: categoryError,
    } = await database.getCategories();

    if (categoryError) {
      return { data: null, status: categoryStatus, error: categoryError };
    }

    let query = supabase.client.from("products").select("*");

    if (selectedCategory) {
      const { data: matchedCategory } = await supabase.client
        .from("categories")
        .select("id")
        .eq("name", selectedCategory)
        .single();

      if (matchedCategory) {
        query = query.eq("category_id", matchedCategory.id);
      }
    }

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const result = await query;
    return result;
  },
};

const api = {
  supabase,
  database,
};

export default api;
